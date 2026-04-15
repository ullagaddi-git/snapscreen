import { spawn, ChildProcess, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import { DisplayInfo } from './monitors'
import { getSettings } from './settings'

// Cached audio devices
let cachedAudioDevices: string[] | null = null

type AudioSource = 'system' | 'mic' | 'both' | 'none'

let ffmpegProcess: ChildProcess | null = null
let currentOutputPath: string | null = null
let currentTmpPath: string | null = null

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

function detectAudioDevices(): string[] {
  if (cachedAudioDevices) return cachedAudioDevices

  try {
    const ffmpegPath = getFfmpegPath()
    const output = execSync(`"${ffmpegPath}" -list_devices true -f dshow -i dummy 2>&1`, {
      encoding: 'utf-8',
      timeout: 5000,
      shell: true,
    })

    const audioDevices: string[] = []
    const lines = output.split('\n')
    let inAudio = false
    for (const line of lines) {
      if (line.includes('(audio)')) {
        // Extract device name between quotes
        const match = line.match(/"([^"]+)"/)
        if (match) {
          audioDevices.push(match[1])
          inAudio = true
        }
      }
    }

    cachedAudioDevices = audioDevices
    console.log('Detected audio devices:', audioDevices)
    return audioDevices
  } catch {
    console.warn('Failed to detect audio devices')
    cachedAudioDevices = []
    return []
  }
}

// --- Recording state ---

export function isRecording(): boolean {
  return ffmpegProcess !== null
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

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const baseName = `SnapScreen_${year}-${month}-${day}_${hours}${minutes}${seconds}`
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

  console.log('Starting FFmpeg:', ffmpegPath, args.join(' '))

  return new Promise((resolve, reject) => {
    ffmpegProcess = spawn(ffmpegPath, args, { shell: false })
    currentOutputPath = outputPath
    currentTmpPath = tmpPath

    ffmpegProcess.stderr?.on('data', (data: Buffer) => {
      const msg = data.toString()
      // FFmpeg outputs progress info to stderr — only log errors
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

    ffmpegProcess.on('exit', (code) => {
      console.log('FFmpeg exited with code:', code)
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

      // Atomic rename: tmp → final
      try {
        if (fs.existsSync(tmpPath)) {
          fs.renameSync(tmpPath, outputPath)
          console.log('Recording saved:', outputPath)
          resolve(outputPath)
        } else {
          reject(new Error('Recording file not found after FFmpeg exit'))
        }
      } catch (err) {
        reject(err)
      }
    })

    // Send 'q' to FFmpeg stdin for graceful quit
    if (proc.stdin?.writable) {
      proc.stdin.write('q')
    } else {
      // Fallback: send SIGINT
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
