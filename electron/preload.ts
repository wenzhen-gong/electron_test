// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const api: KaskadeApi = {
  readDataFile: () => ipcRenderer.invoke('read-data-file'),
  writeDataFile: (content: string) => {
    ipcRenderer.send('write-data-file', content);
  },
  runLoadTest: (config: LoadTestConfig) => ipcRenderer.invoke('run-load-test', config)
};

contextBridge.exposeInMainWorld('api', api);
