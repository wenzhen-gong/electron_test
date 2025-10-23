// electron/main.ts
import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import fs from 'fs';
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.whenReady().then(() => {
  // ✅ 先注册 CSP 拦截
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    let headers = details.responseHeaders || {};
    delete headers['Content-Security-Policy'];
    delete headers['content-security-policy'];
    headers['Content-Security-Policy'] = [
      `
        default-src 'self' http://localhost:5173;
        connect-src 'self' http://localhost:8080 ws://localhost:8080 http://localhost:5173;
        style-src 'self' 'unsafe-inline' http://localhost:5173;
        script-src 'self' 'unsafe-eval' http://localhost:5173;
        img-src 'self' data: http://localhost:5173;
      `,
    ];
    callback({ responseHeaders: headers });
  });

  // ✅ 再创建窗口
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    },
  });

  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if(meta) meta.remove();
    `);
  });
});

ipcMain.handle('run-load-test', async (_event, config) => {
  console.log(config);
  return new Promise((resolve, reject) => {
    const child = spawn(path.join(__dirname, '..', 'loadtester'));
    child.stdin.write(JSON.stringify(config));
    child.stdin.end();

    let output = '';
    child.stdout.on('data', (data) => (output += data));
    child.stderr.on('data', (data) => console.error(data.toString()));
    child.on('close', () => {
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
});

ipcMain.handle('read-data-file', () => {
  const filePath = path.join(app.getAppPath(), 'datafile.json');
  return fs.readFileSync(filePath, 'utf8');
});

ipcMain.on('write-data-file', (event, content) => {
  fs.writeFileSync(path.join(__dirname, '../datafile.json'), content);
});
