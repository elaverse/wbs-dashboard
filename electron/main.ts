import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import https from 'https';
import http from 'http';

const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const JSON_FILE_NAME = 'wbs';

function makeRequest(
  url: string,
  method: string,
  body: Record<string, unknown>,
  token: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const params = new URLSearchParams();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
    const data = params.toString();
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data),
      },
      rejectUnauthorized: false,
    };
    const req = (isHttps ? https : http).request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => { chunks += chunk.toString(); });
      res.on('end', () => resolve(chunks));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ipcMain.handle('wbs:load', async (_event, apiBase: string, token: string) => {
    const response = await makeRequest(
      `${apiBase}/common/app/itsm/jsonDownload`,
      'POST',
      { jsonFileName: JSON_FILE_NAME },
      token
    );
    const result = JSON.parse(response);
    const data = result?.data ?? result;
    return Array.isArray(data) ? data : [];
  });
  ipcMain.handle('wbs:save', async (_event, apiBase: string, token: string, tasks: unknown[]) => {
    await makeRequest(
      `${apiBase}/common/app/itsm/jsonUpload`,
      'POST',
      { jsonFileName: JSON_FILE_NAME, data: tasks },
      token
    );
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
