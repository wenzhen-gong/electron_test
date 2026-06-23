// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
console.log('✅ Preload script loaded');
console.log('window.api =', window.api);

contextBridge.exposeInMainWorld('api', {
  readDataFile: () => ipcRenderer.invoke('read-data-file'),
  writeDataFile: (content: string) => {
    return ipcRenderer.send('write-data-file', content);
  },
  runLoadTest: (config: any) => ipcRenderer.invoke('run-load-test', config)
});
