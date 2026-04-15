import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('snapscreen', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSetting: (key: string, value: unknown) => ipcRenderer.invoke('settings:set', key, value),
  listMonitors: () => ipcRenderer.invoke('monitors:list'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openFolder: (path: string) => ipcRenderer.invoke('shell:openFolder', path),
  getRecordingState: () => ipcRenderer.invoke('recording:getState'),
  validateHotkey: (accelerator: string) => ipcRenderer.invoke('hotkey:validate', accelerator),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
})
