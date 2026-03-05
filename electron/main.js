const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Social Lead Extractor Pro',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0F172A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    frame: process.platform !== 'darwin',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendDir = path.join(__dirname, '..', 'backend');
  const isPackaged = app.isPackaged;

  try {
    if (isPackaged) {
      // In production, try python3 first, then python
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      backendProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendDir,
        env: { ...process.env, DATABASE_PATH: path.join(app.getPath('userData'), 'leads.db') },
      });
    } else {
      // In development, use poetry
      backendProcess = spawn('poetry', ['run', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendDir,
        env: { ...process.env },
      });
    }

    backendProcess.stdout.on('data', (data) => {
      console.log(`[Backend] ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`[Backend] ${data}`);
    });

    backendProcess.on('error', (err) => {
      console.error(`[Backend] Failed to start: ${err.message}`);
      console.error('[Backend] Python may not be installed. The UI will still work but extraction features require Python.');
      backendProcess = null;
    });

    backendProcess.on('close', (code) => {
      console.log(`[Backend] Process exited with code ${code}`);
    });
  } catch (err) {
    console.error(`[Backend] Failed to start backend: ${err.message}`);
    backendProcess = null;
  }
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  // Create window immediately, start backend in background
  createWindow();
  startBackend();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('open-external', (_event, url) => {
  shell.openExternal(url);
});
