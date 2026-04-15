import { app, BrowserWindow } from 'electron'
import path from 'path'
import { getSettings } from './settings'
import { createTray } from './tray'
import { registerIpcHandlers } from './ipc'

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
    height: 480,
    resizable: false,
    alwaysOnTop: true,
    title: 'SnapScreen Settings',
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

app.whenReady().then(() => {
  console.log('SnapScreen settings:', JSON.stringify(getSettings(), null, 2))

  registerIpcHandlers()
  createTray()

  // No BrowserWindow on launch — tray-only app
})

app.on('window-all-closed', () => {
  // Don't quit when all windows close — we're a tray app
})
