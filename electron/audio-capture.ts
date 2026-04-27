import { BrowserWindow, ipcMain, desktopCapturer, screen } from 'electron'
import path from 'path'
import fs from 'fs'

let captureWindow: BrowserWindow | null = null
let audioFileStream: fs.WriteStream | null = null
let currentAudioPath: string | null = null
let finishedResolver: (() => void) | null = null
let ipcRegistered = false
let pendingSourceId: string | null = null

function ensureIpcHandlers(): void {
  if (ipcRegistered) return
  ipcRegistered = true

  ipcMain.on('audio-capture:chunk', (_event, chunk: Uint8Array) => {
    if (audioFileStream && chunk && chunk.length) {
      audioFileStream.write(Buffer.from(chunk))
    }
  })

  ipcMain.handle('audio-capture:finished', async () => {
    if (audioFileStream) {
      await new Promise<void>((resolve) => audioFileStream!.end(() => resolve()))
      audioFileStream = null
    }
    if (finishedResolver) {
      finishedResolver()
      finishedResolver = null
    }
    return { success: true }
  })

  ipcMain.on('audio-capture:error', (_event, err: string) => {
    console.error('System audio capture error:', err)
  })

  ipcMain.handle('audio-capture:requestSourceId', async () => {
    return pendingSourceId || ''
  })
}

async function getDisplaySourceId(displayId: number): Promise<string | null> {
  const sources = await desktopCapturer.getSources({ types: ['screen'] })
  // Try to match by display_id
  const match = sources.find((s) => {
    // s.display_id is a string in Electron
    return s.display_id === String(displayId)
  })
  if (match) return match.id
  // Fallback: use the source corresponding to the primary display
  const primary = screen.getPrimaryDisplay()
  if (displayId === primary.id && sources.length > 0) {
    return sources[0].id
  }
  // Default to first available source
  return sources[0]?.id || null
}

export async function startSystemAudioCapture(displayId: number, audioOutputPath: string): Promise<void> {
  ensureIpcHandlers()

  if (captureWindow && !captureWindow.isDestroyed()) {
    throw new Error('Audio capture already in progress')
  }

  const sourceId = await getDisplaySourceId(displayId)
  if (!sourceId) {
    throw new Error('Could not find display source for system audio capture')
  }
  pendingSourceId = sourceId

  // Open output stream
  fs.mkdirSync(path.dirname(audioOutputPath), { recursive: true })
  audioFileStream = fs.createWriteStream(audioOutputPath)
  currentAudioPath = audioOutputPath

  captureWindow = new BrowserWindow({
    width: 200,
    height: 100,
    show: false, // hidden — runs invisibly
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/audio-capture-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  await captureWindow.loadFile(path.join(__dirname, '../renderer/audio-capture.html'))

  // Trigger startCapture in the renderer
  await captureWindow.webContents.executeJavaScript(
    `window.__startCapture(${JSON.stringify(sourceId)})`
  )
}

export async function stopSystemAudioCapture(): Promise<string | null> {
  if (!captureWindow || captureWindow.isDestroyed()) return null

  const finishedPromise = new Promise<void>((resolve) => {
    finishedResolver = resolve
  })

  // Trigger stop in renderer
  try {
    await captureWindow.webContents.executeJavaScript('window.__stopCapture()')
  } catch (e) {
    console.warn('Failed to call __stopCapture:', e)
  }

  // Wait for the renderer's onstop callback (with timeout)
  await Promise.race([
    finishedPromise,
    new Promise<void>((resolve) => setTimeout(resolve, 3000)),
  ])

  // Cleanup
  if (audioFileStream) {
    await new Promise<void>((resolve) => audioFileStream!.end(() => resolve()))
    audioFileStream = null
  }

  const result = currentAudioPath
  currentAudioPath = null

  if (captureWindow && !captureWindow.isDestroyed()) {
    captureWindow.close()
    captureWindow = null
  }

  return result
}

export function isSystemAudioCapturing(): boolean {
  return captureWindow !== null && !captureWindow.isDestroyed()
}
