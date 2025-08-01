import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      runLoadTest: (config: any) => Promise<any>
      readDataFile: () => unknown
      writeDataFile: () => unknown
    }
  }
}
