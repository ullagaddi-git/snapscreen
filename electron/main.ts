import { app, BrowserWindow, globalShortcut, Notification, shell } from 'electron'
import path from 'path'
import { getSettings, setSetting } from './settings'
import { createTray, setTrayState } from './tray'
import { registerIpcHandlers } from './ipc'
import { listMonitors } from './monitors'
import { startRecording, stopRecording, isRecording, verifyFfmpeg, onUnexpectedExit } from './recorder'

// Hide dock icon on macOS (no-op on Windows, but safe)
app.dock?.hide()

// Set app user model ID for Windows notifications
app.setAppUserModelId('com.snapscreen.app')

let settingsWindow: BrowserWindow | null = null

export function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 480,
    height: 520,
    resizable: false,
    alwaysOnTop: true,
    title: 'SnapScreen Settings',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    settingsWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// --- Toggle recording (used by hotkey and tray menu) ---

export async function toggleRecording(): Promise<void> {
  console.log('=== TOGGLE RECORDING ===')
  console.log('isRecording:', isRecording())
  const settings = getSettings()
  console.log('selectedDisplayId:', settings.selectedDisplayId)

  if (!isRecording()) {
    // --- Start recording ---

    // TASK-028: No monitor selected
    if (settings.selectedDisplayId === null) {
      new Notification({
        title: 'SnapScreen',
        body: 'Please select a monitor first. Right-click the tray icon.',
      }).show()
      return
    }

    // Find the selected display
    let display = listMonitors().find(m => m.id === settings.selectedDisplayId)

    // TASK-029: Selected monitor disconnected — fall back to primary
    if (!display) {
      const primary = listMonitors().find(m => m.isPrimary)
      if (!primary) {
        new Notification({
          title: 'SnapScreen',
          body: 'No monitors detected. Cannot start recording.',
        }).show()
        setTrayState('error')
        return
      }

      new Notification({
        title: 'SnapScreen',
        body: `${settings.selectedDisplayLabel} not found — using primary display.`,
      }).show()

      // Update settings to the fallback
      setSetting('selectedDisplayId', primary.id)
      setSetting('selectedDisplayLabel', primary.label)
      display = primary
    }

    try {
      await startRecording(display, settings.audioSource)
      setTrayState('recording')
      console.log('Recording started on:', display.label)
    } catch (err) {
      console.error('Failed to start recording:', err)
      setTrayState('error')
      new Notification({
        title: 'SnapScreen — Error',
        body: `Failed to start recording: ${err instanceof Error ? err.message : String(err)}`,
      }).show()
    }
  } else {
    // --- Stop recording ---
    try {
      const savedPath = await stopRecording()
      setTrayState('idle')
      console.log('Recording saved:', savedPath)

      // Show notification (TASK-018)
      if (settings.showNotificationOnSave) {
        const filename = path.basename(savedPath)
        const folder = path.dirname(savedPath)
        const notification = new Notification({
          title: 'Recording saved',
          body: filename,
        })
        notification.on('click', () => {
          shell.openPath(folder)
        })
        notification.show()
      }
    } catch (err) {
      console.error('Failed to stop recording:', err)
      setTrayState('error')
      new Notification({
        title: 'SnapScreen — Error',
        body: `Failed to save recording: ${err instanceof Error ? err.message : String(err)}`,
      }).show()
    }
  }
}

// --- App lifecycle ---

app.whenReady().then(() => {
  console.log('SnapScreen settings:', JSON.stringify(getSettings(), null, 2))

  // Verify FFmpeg is available
  verifyFfmpeg()

  // TASK-030: Handle unexpected FFmpeg crashes
  onUnexpectedExit((partialFile) => {
    setTrayState('idle')
    new Notification({
      title: 'SnapScreen — Error',
      body: 'Recording stopped unexpectedly. A partial file may have been saved.',
    }).show()
    console.error('FFmpeg crashed unexpectedly. Partial file:', partialFile)
  })

  registerIpcHandlers()
  createTray()

  // TASK-027: First-run onboarding notification
  const currentSettings = getSettings()
  if (currentSettings.isFirstRun) {
    new Notification({
      title: 'SnapScreen is running',
      body: 'Right-click the tray icon to choose your recording monitor.',
    }).show()
    setSetting('isFirstRun', false)
  }

  // Register global hotkey — try the configured one, fallback to Alt+Shift+R
  const settings = getSettings()
  // Avoid function keys (HP Hotkey Support intercepts them)
  const hotkeysToTry = ['CommandOrControl+Alt+R', 'Alt+Shift+R', settings.hotkeyAccelerator]
  let registeredHotkey: string | null = null

  for (const hotkey of hotkeysToTry) {
    try {
      const registered = globalShortcut.register(hotkey, toggleRecording)
      if (registered && globalShortcut.isRegistered(hotkey)) {
        console.log('Global hotkey registered successfully:', hotkey)
        registeredHotkey = hotkey
        break
      } else {
        console.warn('Hotkey registration returned false:', hotkey)
        globalShortcut.unregister(hotkey)
      }
    } catch (err) {
      console.warn('Hotkey registration threw error:', hotkey, err)
    }
  }

  if (registeredHotkey) {
    new Notification({
      title: 'SnapScreen Ready',
      body: `Press ${registeredHotkey} to start/stop recording.`,
    }).show()
  } else {
    console.error('Failed to register any global hotkey')
    new Notification({
      title: 'SnapScreen — Hotkey Error',
      body: 'Could not register any hotkey. Other apps may be blocking it.',
    }).show()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  // Don't quit when all windows close — we're a tray app
})
