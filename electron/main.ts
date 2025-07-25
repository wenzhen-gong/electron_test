// electron/main.ts
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { spawn } from 'child_process'

let mainWindow: BrowserWindow

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  mainWindow.loadURL('http://localhost:5173')
})

ipcMain.handle('run-load-test', async (_event, config) => {
  return new Promise((resolve, reject) => {
    const child = spawn(path.join(__dirname, '..', 'loadtester'))
    child.stdin.write(JSON.stringify(config))
    child.stdin.end()

    let output = ''
    child.stdout.on('data', (data) => (output += data))
    child.stderr.on('data', (data) => console.error(data.toString()))
    child.on('close', () => {
      console.log(output)
      try {
        const result = JSON.parse(output)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    })
  })
})
