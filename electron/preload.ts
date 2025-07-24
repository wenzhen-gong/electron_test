// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  runLoadTest: (config: any) => ipcRenderer.invoke('run-load-test', config)
})
