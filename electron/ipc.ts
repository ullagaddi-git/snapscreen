import { ipcMain, dialog, shell, app, globalShortcut } from 'electron'
import { getSettings, setSetting, SnapScreenSettings } from './settings'
import { listMonitors } from './monitors'
import { isRecording } from './recorder'
import { toggleRecording } from './main'

export function registerIpcHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    return getSettings()
  })

  ipcMain.handle('settings:set', async (_event, key: keyof SnapScreenSettings, value: unknown) => {
    try {
      setSetting(key, value as SnapScreenSettings[typeof key])

      // Side effects for specific settings
      if (key === 'launchAtStartup') {
        app.setLoginItemSettings({ openAtLogin: value as boolean })
      }

      if (key === 'hotkeyAccelerator') {
        // Unregister all and re-register with new hotkey
        globalShortcut.unregisterAll()
        const newHotkey = value as string
        const registered = globalShortcut.register(newHotkey, toggleRecording)
        if (!registered) {
          return { success: false, error: 'Hotkey could not be registered' }
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('monitors:list', async () => {
    return listMonitors()
  })

  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    return result.filePaths[0]
  })

  ipcMain.handle('shell:openFolder', async (_event, folderPath: string) => {
    await shell.openPath(folderPath)
  })

  ipcMain.handle('recording:getState', async () => {
    return { isRecording: isRecording() }
  })

  // TASK-038: Known hotkey conflicts for common apps
  const knownConflicts: Record<string, string> = {
    'CommandOrControl+Shift+R': 'Chrome/Edge (hard reload)',
    'CommandOrControl+Shift+I': 'Chrome/Edge (DevTools)',
    'CommandOrControl+Shift+P': 'VS Code (Command Palette)',
    'CommandOrControl+Shift+F': 'VS Code/Slack (Search)',
    'CommandOrControl+Shift+E': 'VS Code (Explorer)',
    'CommandOrControl+Shift+M': 'VS Code (Problems panel)',
    'CommandOrControl+Shift+S': 'VS Code (Save All)',
    'Alt+Shift+F': 'VS Code (Format document)',
  }

  ipcMain.handle('hotkey:validate', async (_event, accelerator: string) => {
    if (!accelerator || accelerator.length === 0) {
      return { valid: false, conflict: null }
    }

    // Check known conflicts
    const conflict = knownConflicts[accelerator] || null

    // Check if already registered by us
    if (globalShortcut.isRegistered(accelerator)) {
      return { valid: true, conflict }
    }
    // Try to register temporarily
    try {
      const ok = globalShortcut.register(accelerator, () => {})
      if (ok) {
        globalShortcut.unregister(accelerator)
        return { valid: true, conflict }
      }
      return { valid: false, conflict: 'Hotkey is in use by another application' }
    } catch {
      return { valid: false, conflict: 'Hotkey could not be registered' }
    }
  })

  ipcMain.handle('audio:testSource', async (_event, source: string) => {
    const { detectAvailableAudioDevices } = require('./recorder')
    const devices = detectAvailableAudioDevices()
    if (source === 'none') return { available: true, devices }
    if (devices.length === 0) {
      return { available: false, reason: 'No audio devices detected', devices }
    }
    return { available: true, devices }
  })

  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion()
  })
}
