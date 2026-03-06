const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
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
    title: 'SnapLeads',
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

// ─── License Management IPC ───────────────────────────────────────────────

const LICENSE_SECRET = process.env.SNAPLEADS_LICENSE_SECRET || 'default-license-secret';

function getLicenseFilePath() {
  return path.join(app.getPath('userData'), 'license.json');
}

function computeHmac(data) {
  return crypto.createHmac('sha256', LICENSE_SECRET).update(data).digest('hex');
}

function getDeviceId() {
  const os = require('os');
  const raw = `${os.hostname()}-${os.platform()}-${os.arch()}-${os.cpus()[0]?.model || 'unknown'}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

ipcMain.handle('license-get', () => {
  try {
    const filePath = getLicenseFilePath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    // Verify HMAC integrity
    const { signature, ...payload } = data;
    const expected = computeHmac(JSON.stringify(payload));
    if (signature !== expected) {
      console.error('[License] Signature mismatch - license tampered');
      return null;
    }
    return payload;
  } catch (err) {
    console.error('[License] Failed to read license:', err.message);
    return null;
  }
});

ipcMain.handle('license-save', (_event, licenseData) => {
  try {
    const filePath = getLicenseFilePath();
    const signature = computeHmac(JSON.stringify(licenseData));
    const dataWithSig = { ...licenseData, signature };
    fs.writeFileSync(filePath, JSON.stringify(dataWithSig, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('[License] Failed to save license:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('license-remove', () => {
  try {
    const filePath = getLicenseFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (err) {
    console.error('[License] Failed to remove license:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('license-get-device-id', () => {
  return getDeviceId();
});

ipcMain.handle('license-activate-online', async (_event, licenseKey) => {
  const deviceId = getDeviceId();
  const API_URL = 'https://snapleads-api.onrender.com';

  return new Promise((resolve) => {
    const postData = JSON.stringify({ key: licenseKey, device_id: deviceId });
    const urlObj = new URL(`${API_URL}/api/license/activate`);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const req = protocol.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 15000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode === 200 && result.activated) {
            // Save license locally — map backend response to local format
            const tier = result.plan || 'starter';
            const cycle = result.billing_cycle || 'monthly';
            const licenseData = {
              key: licenseKey,
              tier: tier,
              cycle: cycle,
              activated_at: new Date().toISOString(),
              expires_at: result.expires_at || null,
              device_id: deviceId,
              token: result.signature || '',
            };
            const hmacSig = computeHmac(JSON.stringify(licenseData));
            const dataWithSig = { ...licenseData, signature: hmacSig };
            fs.writeFileSync(getLicenseFilePath(), JSON.stringify(dataWithSig, null, 2), 'utf-8');
            resolve({ success: true, tier: tier, cycle: cycle, expires_at: result.expires_at });
          } else {
            resolve({ success: false, error: result.message || result.detail || result.error || 'Activation failed' });
          }
        } catch (parseErr) {
          resolve({ success: false, error: 'Invalid server response' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: `Connection failed: ${err.message}` });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Connection timed out' });
    });

    req.write(postData);
    req.end();
  });
});
