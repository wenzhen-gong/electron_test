// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readDataFile: () => ipcRenderer.invoke('read-data-file'),
  writeDataFile: (content) => {
    return ipcRenderer.send("write-data-file", content);
  },
  runLoadTest: (config: any) => ipcRenderer.invoke('run-load-test', config)
})
