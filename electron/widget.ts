import { BrowserWindow, screen, ipcMain } from 'electron'
import path from 'path'

let widgetWindow: BrowserWindow | null = null

export function openWidget(): void {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.focus()
    return
  }

  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth } = primaryDisplay.workAreaSize

  widgetWindow = new BrowserWindow({
    width: 220,
    height: 56,
    x: screenWidth - 240,
    y: 60,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/widget-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  widgetWindow.loadFile(path.join(__dirname, '../renderer/widget.html'))

  widgetWindow.on('closed', () => {
    widgetWindow = null
  })
}

export function closeWidget(): void {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.close()
    widgetWindow = null
  }
}

export function isWidgetOpen(): boolean {
  return widgetWindow !== null && !widgetWindow.isDestroyed()
}

interface WidgetCallbacks {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  pauseRecording: () => Promise<void>
  resumeRecording: () => Promise<void>
  isRecording: () => boolean
  isPaused: () => boolean
  getRecordingDuration: () => string
}

export function registerWidgetIpc(callbacks: WidgetCallbacks): void {
  ipcMain.handle('widget:startRecording', async () => {
    try {
      await callbacks.startRecording()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('widget:stopRecording', async () => {
    try {
      await callbacks.stopRecording()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('widget:pauseRecording', async () => {
    try {
      await callbacks.pauseRecording()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('widget:resumeRecording', async () => {
    try {
      await callbacks.resumeRecording()
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('widget:getRecordingState', async () => {
    return {
      isRecording: callbacks.isRecording(),
      isPaused: callbacks.isPaused(),
      duration: (callbacks.isRecording() || callbacks.isPaused()) ? callbacks.getRecordingDuration() : null,
    }
  })
}
