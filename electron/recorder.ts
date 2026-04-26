import { spawn, ChildProcess, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import dayjs from 'dayjs'
import { DisplayInfo } from './monitors'
import { getSettings } from './settings'

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

  // Audio capture — detect available devices
  if (audioSource !== 'none') {
    const audioDevices = detectAudioDevices()
    if (audioDevices.length > 0) {
      // Use the first available audio device (typically the microphone)
      args.push('-f', 'dshow', '-i', `audio=${audioDevices[0]}`)
    }
  }

  // Video encoding — use libx264 ultrafast for broad compatibility
  args.push(
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-pix_fmt', 'yuv420p',
  )

  // Audio encoding if we added an audio input
  const hasAudioInput = args.includes('-f') && args.indexOf('dshow') > args.indexOf('desktop')
  if (hasAudioInput) {
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

    // Give FFmpeg a moment to start, then resolve
    setTimeout(() => {
      if (ffmpegProcess) {
        resolve()
      }
    }, 500)
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

  return new Promise((resolve, reject) => {
    const proc = ffmpegProcess!

    // Timeout: force kill after 5 seconds
    const killTimeout = setTimeout(() => {
      console.warn('FFmpeg did not exit gracefully, killing...')
      proc.kill('SIGKILL')
    }, 5000)

    proc.on('exit', () => {
      clearTimeout(killTimeout)
      ffmpegProcess = null
      currentOutputPath = null
      currentTmpPath = null

      // TASK-031: Atomic rename with detailed error handling
      try {
        if (fs.existsSync(tmpPath)) {
          fs.renameSync(tmpPath, outputPath)
          console.log('Recording saved:', outputPath)
          resolve(outputPath)
        } else {
          reject(new Error('Recording file not found after FFmpeg exit'))
        }
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
