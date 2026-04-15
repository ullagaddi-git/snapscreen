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

  ipcMain.handle('hotkey:validate', async (_event, accelerator: string) => {
    if (!accelerator || accelerator.length === 0) {
      return { valid: false }
    }
    // Check if already registered by another app
    if (globalShortcut.isRegistered(accelerator)) {
      return { valid: true } // We own it
    }
    // Try to register temporarily to see if it works
    try {
      const ok = globalShortcut.register(accelerator, () => {})
      if (ok) {
        globalShortcut.unregister(accelerator)
        return { valid: true }
      }
      return { valid: false }
    } catch {
      return { valid: false }
    }
  })

  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion()
  })
}
