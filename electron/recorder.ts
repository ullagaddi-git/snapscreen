import { spawn, ChildProcess, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import dayjs from 'dayjs'
import { DisplayInfo } from './monitors'
import { getSettings } from './settings'
import { startSystemAudioCapture, stopSystemAudioCapture } from './audio-capture'

// Cached audio devices
let cachedAudioDevices: string[] | null = null

type AudioSource = 'system' | 'mic' | 'both' | 'none'

let ffmpegProcess: ChildProcess | null = null
let currentOutputPath: string | null = null
let currentTmpPath: string | null = null
let isExpectedStop = false
let unexpectedExitCallback: ((partialFile: string | null) => void) | null = null
let isPaused = false
let pausedDisplay: DisplayInfo | null = null
let pausedAudioSource: AudioSource | null = null
let currentDisplay: DisplayInfo | null = null
let currentAudioSource: AudioSource | null = null
let currentSystemAudioPath: string | null = null

// --- FFmpeg path resolution ---

export function getFfmpegPath(): string {
  if (app.isPackaged) {
    // In production, ffmpeg-static is in extraResources
    const resourcePath = path.join(process.resourcesPath, 'ffmpeg-static', 'ffmpeg.exe')
    if (fs.existsSync(resourcePath)) return resourcePath
  }

  // In dev, use the node_modules path
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static') as string
    return ffmpegStatic
  } catch {
    throw new Error('FFmpeg binary not found. Ensure ffmpeg-static is installed.')
  }
}

// --- Audio device detection ---

export function detectAvailableAudioDevices(): string[] {
  return detectAudioDevices()
}

function detectAudioDevices(): string[] {
  if (cachedAudioDevices) return cachedAudioDevices

  // FFmpeg -list_devices ALWAYS exits with code 1 (it's expected behavior)
  // and writes the device list to stderr. We need spawnSync to capture stderr properly.
  try {
    const { spawnSync } = require('child_process')
    const ffmpegPath = getFfmpegPath()
    const result = spawnSync(ffmpegPath, ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy'], {
      encoding: 'utf-8',
      timeout: 5000,
      shell: false,
    })

    // Combine stdout + stderr (FFmpeg outputs to stderr)
    const output = (result.stdout || '') + (result.stderr || '')

    const audioDevices: string[] = []
    const lines = output.split('\n')
    for (const line of lines) {
      if (line.includes('(audio)')) {
        // Extract device name between quotes
        const match = line.match(/"([^"]+)"/)
        if (match) {
          audioDevices.push(match[1])
        }
      }
    }

    cachedAudioDevices = audioDevices
    console.log('Detected audio devices:', audioDevices.length, audioDevices)
    return audioDevices
  } catch (err) {
    console.warn('Failed to detect audio devices:', err)
    cachedAudioDevices = []
    return []
  }
}

// --- Crash callback registration (TASK-030) ---

export function onUnexpectedExit(callback: (partialFile: string | null) => void): void {
  unexpectedExitCallback = callback
}

// --- Recording state ---

let recordingStartTime: number | null = null

export function isRecording(): boolean {
  return ffmpegProcess !== null
}

export function getRecordingStartTime(): number | null {
  return recordingStartTime
}

export function isRecordingPaused(): boolean {
  return isPaused
}

export async function pauseRecording(): Promise<void> {
  if (!ffmpegProcess) {
    throw new Error('No recording in progress')
  }
  // Save the current display/audio settings so we can resume
  pausedDisplay = currentDisplay
  pausedAudioSource = currentAudioSource
  await stopRecording()
  isPaused = true
}

export async function resumeRecording(): Promise<void> {
  if (!isPaused || !pausedDisplay || !pausedAudioSource) {
    throw new Error('No paused recording to resume')
  }
  isPaused = false
  await startRecording(pausedDisplay, pausedAudioSource)
  pausedDisplay = null
  pausedAudioSource = null
}

export function getRecordingDuration(): string {
  if (!recordingStartTime) return '00:00:00'
  const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// --- Output file naming (TASK-017) ---

function generateOutputPath(): string {
  const settings = getSettings()
  const folder = settings.outputFolder

  // Create folder if it doesn't exist
  fs.mkdirSync(folder, { recursive: true })

  // Check folder is writable
  try {
    fs.accessSync(folder, fs.constants.W_OK)
  } catch {
    throw new Error(`Output folder is not writable: ${folder}`)
  }

  // TASK-040: Custom filename pattern using dayjs
  const dateFormat = settings.filenameDateFormat || 'YYYY-MM-DD_HHmmss'
  const dateStr = dayjs().format(dateFormat)
  // Sanitize: remove characters invalid in Windows filenames
  const safeDateStr = dateStr.replace(/[<>:"/\\|?*]/g, '-')
  const baseName = `SnapScreen_${safeDateStr}`
  let outputPath = path.join(folder, `${baseName}.mp4`)

  // Handle duplicate filenames
  let counter = 2
  while (fs.existsSync(outputPath)) {
    outputPath = path.join(folder, `${baseName}_${counter}.mp4`)
    counter++
  }

  return outputPath
}

// --- Recording start (TASK-013) ---

export async function startRecording(display: DisplayInfo, audioSource: AudioSource): Promise<void> {
  if (ffmpegProcess) {
    throw new Error('Recording is already in progress')
  }

  // Track for pause/resume support
  currentDisplay = display
  currentAudioSource = audioSource

  const ffmpegPath = getFfmpegPath()
  const outputPath = generateOutputPath()
  const tmpPath = outputPath.replace('.mp4', '.tmp.mp4')

  // Build FFmpeg args using gdigrab with crop for the target display
  const { x, y, width, height } = display.bounds

  const args: string[] = [
    '-f', 'gdigrab',
    '-framerate', '30',
    '-offset_x', String(x),
    '-offset_y', String(y),
    '-video_size', `${width}x${height}`,
    '-i', 'desktop',
  ]

  // Audio capture — three FFmpeg-driven modes; system audio handled separately
  // Modes:
  //   'none'   → video only
  //   'mic'    → FFmpeg captures microphone via dshow
  //   'system' → FFmpeg video only; system audio captured by hidden window
  //   'both'   → FFmpeg captures mic; system audio captured separately, mixed on stop
  let micAttached = false
  if (audioSource === 'mic' || audioSource === 'both') {
    const audioDevices = detectAudioDevices()
    if (audioDevices.length > 0) {
      args.push('-f', 'dshow', '-i', `audio=${audioDevices[0]}`)
      micAttached = true
    } else {
      console.warn('No microphone device detected — falling back to video-only')
    }
  }

  // Video encoding
  args.push(
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
  )

  if (micAttached) {
    args.push('-c:a', 'aac')
  } else {
    args.push('-an')
  }

  args.push('-y', tmpPath)

  // TASK-035: Performance target — recording start latency < 1000ms from trigger to first frame
  console.log('Starting FFmpeg:', ffmpegPath, args.join(' '))

  const startTime = performance.now()

  return new Promise((resolve, reject) => {
    isExpectedStop = false
    recordingStartTime = Date.now()
    ffmpegProcess = spawn(ffmpegPath, args, { shell: false })
    currentOutputPath = outputPath
    currentTmpPath = tmpPath

    ffmpegProcess.stderr?.on('data', (data: Buffer) => {
      const msg = data.toString()
      if (msg.includes('Error') || msg.includes('error')) {
        console.error('FFmpeg error:', msg)
      }
    })

    ffmpegProcess.on('error', (err) => {
      console.error('FFmpeg process error:', err)
      ffmpegProcess = null
      currentOutputPath = null
      currentTmpPath = null
      reject(err)
    })

    // TASK-030: Handle unexpected FFmpeg crash
    ffmpegProcess.on('exit', (code) => {
      const latency = performance.now() - startTime
      console.log(`FFmpeg exited with code: ${code} (after ${Math.round(latency)}ms)`)

      if (!isExpectedStop && code !== 0) {
        // Unexpected crash
        const partialFile = currentTmpPath
        ffmpegProcess = null
        currentOutputPath = null
        currentTmpPath = null
        if (unexpectedExitCallback) {
          unexpectedExitCallback(partialFile)
        }
      }
      ffmpegProcess = null
    })

    // Give FFmpeg a moment to start
    setTimeout(async () => {
      if (!ffmpegProcess) return

      // Start system audio capture if requested
      if (audioSource === 'system' || audioSource === 'both') {
        try {
          const audioPath = tmpPath.replace('.tmp.mp4', '.audio.webm')
          await startSystemAudioCapture(display.id, audioPath)
          currentSystemAudioPath = audioPath
          console.log('System audio capture started:', audioPath)
        } catch (err) {
          console.error('System audio capture failed:', err)
          // Continue with video-only
          currentSystemAudioPath = null
        }
      }

      resolve()
    }, 500)
  })
}

// --- Mux helper: combine video file with separately-recorded system audio ---

async function muxVideoAndAudio(
  videoPath: string,
  systemAudioPath: string,
  outputPath: string,
  hasMicInVideo: boolean
): Promise<void> {
  const ffmpegPath = getFfmpegPath()
  const args: string[] = [
    '-i', videoPath,
    '-i', systemAudioPath,
  ]

  if (hasMicInVideo) {
    // Both: mix mic (from video file) with system audio
    args.push(
      '-filter_complex', '[0:a][1:a]amix=inputs=2:duration=longest[a]',
      '-map', '0:v',
      '-map', '[a]',
      '-c:v', 'copy',
      '-c:a', 'aac',
    )
  } else {
    // System audio only: replace audio track
    args.push(
      '-map', '0:v',
      '-map', '1:a',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
    )
  }

  args.push('-y', outputPath)

  console.log('Muxing:', ffmpegPath, args.join(' '))

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, { shell: false })
    let stderr = ''
    proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        console.error('Mux failed:', stderr)
        reject(new Error(`Mux failed with code ${code}`))
      }
    })
    proc.on('error', reject)
  })
}

// --- Recording stop (TASK-014) ---

export async function stopRecording(): Promise<string> {
  if (!ffmpegProcess) {
    throw new Error('No recording in progress')
  }

  isExpectedStop = true
  recordingStartTime = null
  const outputPath = currentOutputPath!
  const tmpPath = currentTmpPath!
  const systemAudioPath = currentSystemAudioPath
  const audioSource = currentAudioSource
  currentSystemAudioPath = null

  return new Promise((resolve, reject) => {
    const proc = ffmpegProcess!

    // Timeout: force kill after 5 seconds
    const killTimeout = setTimeout(() => {
      console.warn('FFmpeg did not exit gracefully, killing...')
      proc.kill('SIGKILL')
    }, 5000)

    proc.on('exit', async () => {
      clearTimeout(killTimeout)
      ffmpegProcess = null
      currentOutputPath = null
      currentTmpPath = null

      try {
        if (!fs.existsSync(tmpPath)) {
          reject(new Error('Recording file not found after FFmpeg exit'))
          return
        }

        // Stop system audio capture if it was running
        if (systemAudioPath) {
          try {
            await stopSystemAudioCapture()
          } catch (err) {
            console.error('Failed to stop system audio capture:', err)
          }
        }

        // If we have a system audio file, mux it with the video
        if (systemAudioPath && fs.existsSync(systemAudioPath) && fs.statSync(systemAudioPath).size > 1000) {
          try {
            const muxedPath = tmpPath.replace('.tmp.mp4', '.muxed.mp4')
            await muxVideoAndAudio(tmpPath, systemAudioPath, muxedPath, audioSource === 'both')
            // Clean up source files, rename muxed to final
            try { fs.unlinkSync(tmpPath) } catch {}
            try { fs.unlinkSync(systemAudioPath) } catch {}
            fs.renameSync(muxedPath, outputPath)
            console.log('Recording saved (with system audio):', outputPath)
            resolve(outputPath)
            return
          } catch (muxErr) {
            console.error('Mux failed, saving video without system audio:', muxErr)
            // Fall through to save video only
          }
        }

        // No system audio (or mux failed) — just rename video
        fs.renameSync(tmpPath, outputPath)
        console.log('Recording saved:', outputPath)
        resolve(outputPath)
      } catch (err) {
        const folder = path.dirname(outputPath)
        reject(new Error(`Couldn't save recording to ${folder} — check folder permissions.`))
      }
    })

    // Send 'q' to FFmpeg stdin for graceful quit
    if (proc.stdin?.writable) {
      proc.stdin.write('q')
    } else {
      proc.kill('SIGINT')
    }
  })
}

// --- Verify FFmpeg is available ---

export function verifyFfmpeg(): boolean {
  try {
    const ffmpegPath = getFfmpegPath()
    const output = execSync(`"${ffmpegPath}" -version`, { encoding: 'utf-8', timeout: 5000 })
    console.log('FFmpeg version:', output.split('\n')[0])
    return true
  } catch (err) {
    console.error('FFmpeg verification failed:', err)
    return false
  }
}
