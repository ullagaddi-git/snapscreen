import { ipcMain, dialog, shell, app } from 'electron'
import { getSettings, setSetting, SnapScreenSettings } from './settings'

export function registerIpcHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    return getSettings()
  })

  ipcMain.handle('settings:set', async (_event, key: keyof SnapScreenSettings, value: unknown) => {
    try {
      setSetting(key, value as SnapScreenSettings[typeof key])
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('monitors:list', async () => {
    // Stub — will be implemented in Phase 1
    return []
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
    // Stub — will be implemented in Phase 1
    return { isRecording: false }
  })

  ipcMain.handle('hotkey:validate', async (_event, accelerator: string) => {
    // Basic validation: check if the accelerator string is non-empty
    return { valid: accelerator.length > 0 }
  })

  ipcMain.handle('app:getVersion', async () => {
    return app.getVersion()
  })
}
