import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('snapscreen', {
  startRecording: () => ipcRenderer.invoke('widget:startRecording'),
  stopRecording: () => ipcRenderer.invoke('widget:stopRecording'),
  pauseRecording: () => ipcRenderer.invoke('widget:pauseRecording'),
  resumeRecording: () => ipcRenderer.invoke('widget:resumeRecording'),
  getRecordingState: () => ipcRenderer.invoke('widget:getRecordingState'),
})
