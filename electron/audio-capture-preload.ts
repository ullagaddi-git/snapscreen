import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('snapscreenAudio', {
  appendChunk: (chunk: Uint8Array) => ipcRenderer.send('audio-capture:chunk', chunk),
  captureFinished: () => ipcRenderer.invoke('audio-capture:finished'),
  captureError: (err: string) => ipcRenderer.send('audio-capture:error', err),
})

// Allow main process to trigger start/stop on the renderer via executeJavaScript
;(window as unknown as { __requestStart: () => void }).__requestStart = () => {
  ipcRenderer.invoke('audio-capture:requestSourceId').then((sourceId: string) => {
    const startFn = (window as unknown as { __startCapture: (id: string) => Promise<unknown> }).__startCapture
    if (startFn) startFn(sourceId)
  })
}
