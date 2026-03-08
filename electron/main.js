const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const { spawn, execSync } = require('child_process');

let mainWindow;
let backendProcess;
let backendReady = false;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Handle NSIS installer lifecycle — quit immediately during install/uninstall/update
if (process.platform === 'win32') {
  const args = process.argv.slice(1);
  if (args.includes('--squirrel-install') || args.includes('--squirrel-updated') ||
      args.includes('--squirrel-uninstall') || args.includes('--squirrel-obsolete')) {
    app.quit();
  }
}

// Allow only a single instance — if a second instance launches (e.g. installer), quit the first one gracefully
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // The installer or another instance launched — focus existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

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

function findPython() {
  // Try multiple Python commands in order of preference
  const candidates = process.platform === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    try {
      const version = execSync(`${cmd} --version`, { encoding: 'utf-8', timeout: 5000 }).trim();
      console.log(`[Backend] Found ${cmd}: ${version}`);
      return cmd;
    } catch {
      // Not found, try next
    }
  }

  // On Windows, check common install paths directly
  if (process.platform === 'win32') {
    const home = process.env.LOCALAPPDATA || process.env.USERPROFILE || '';
    const commonPaths = [
      path.join(home, 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(home, 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(home, 'Programs', 'Python', 'Python310', 'python.exe'),
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Python310\\python.exe',
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Python312', 'python.exe'),
      path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Python311', 'python.exe'),
    ];
    for (const p of commonPaths) {
      try {
        if (fs.existsSync(p)) {
          const version = execSync(`"${p}" --version`, { encoding: 'utf-8', timeout: 5000 }).trim();
          console.log(`[Backend] Found Python at ${p}: ${version}`);
          return `"${p}"`;
        }
      } catch {
        // Not working, try next
      }
    }
  }

  return null;
}

function getPythonDownloadUrl() {
  switch (process.platform) {
    case 'win32': return 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe';
    case 'darwin': return 'https://www.python.org/ftp/python/3.12.8/python-3.12.8-macos11.pkg';
    default: return 'https://www.python.org/downloads/';
  }
}

function getPythonInstallInstructions() {
  switch (process.platform) {
    case 'win32':
      return 'Windows Installation:\n\n' +
        '1. Download Python from the link below\n' +
        '2. IMPORTANT: Check "Add Python to PATH" at the bottom of the installer\n' +
        '3. Click "Install Now"\n' +
        '4. After installation completes, restart SnapLeads\n\n' +
        'Download: ' + getPythonDownloadUrl();
    case 'darwin':
      return 'macOS Installation:\n\n' +
        '1. Download Python from the link below\n' +
        '2. Open the .pkg file and follow the installer\n' +
        '3. After installation completes, restart SnapLeads\n\n' +
        'Or install via Homebrew: brew install python3\n\n' +
        'Download: ' + getPythonDownloadUrl();
    default:
      return 'Linux Installation:\n\n' +
        'Ubuntu/Debian: sudo apt install python3 python3-pip python3-venv\n' +
        'Fedora: sudo dnf install python3 python3-pip\n' +
        'Arch: sudo pacman -S python python-pip\n\n' +
        'After installation, restart SnapLeads.';
  }
}

function showPythonRequiredDialog() {
  if (!mainWindow) return;
  const instructions = getPythonInstallInstructions();
  const downloadUrl = getPythonDownloadUrl();

  dialog.showMessageBox(mainWindow, {
    type: 'warning',
    title: 'Python Required',
    message: 'Python 3.10+ is required for SnapLeads extraction features.',
    detail: instructions,
    buttons: ['Download Python', 'Continue Without Backend', 'Close App'],
    defaultId: 0,
    cancelId: 1,
  }).then(({ response }) => {
    if (response === 0) {
      shell.openExternal(downloadUrl);
    } else if (response === 2) {
      app.quit();
    }
    // response === 1: continue without backend (UI still works)
  });
}

function installBackendDeps(pythonCmd, backendDir) {
  try {
    // Check if dependencies are already installed by testing import
    execSync(`${pythonCmd} -c "import fastapi; import uvicorn"`, {
      cwd: backendDir,
      timeout: 10000,
      env: { ...process.env, PYTHONPATH: backendDir },
    });
    console.log('[Backend] Dependencies already installed');
    return true;
  } catch {
    // Dependencies not installed — try to install them
    console.log('[Backend] Installing dependencies...');
    try {
      execSync(`${pythonCmd} -m pip install fastapi[standard] uvicorn aiosqlite pydantic-settings python-dotenv dnspython requests[socks] openpyxl python-multipart aiohttp-socks psycopg[binary] --quiet`, {
        cwd: backendDir,
        timeout: 120000,
        env: { ...process.env },
      });
      console.log('[Backend] Dependencies installed successfully');
      return true;
    } catch (installErr) {
      console.error(`[Backend] Failed to install dependencies: ${installErr.message}`);
      return false;
    }
  }
}

function getBundledBackendPath() {
  const binaryName = process.platform === 'win32' ? 'snapleads-backend.exe' : 'snapleads-backend';

  // In packaged mode, asarUnpack extracts files to app.asar.unpacked/
  if (app.isPackaged) {
    const unpackedPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'dist', binaryName);
    console.log(`[Backend] Checking unpacked binary: ${unpackedPath}`);
    if (fs.existsSync(unpackedPath)) {
      return unpackedPath;
    }
    // Also check resources/backend/dist (some electron-builder configs)
    const resourcePath = path.join(process.resourcesPath, 'backend', 'dist', binaryName);
    console.log(`[Backend] Checking resource binary: ${resourcePath}`);
    if (fs.existsSync(resourcePath)) {
      return resourcePath;
    }
  }

  // Development or fallback: check relative path
  const devPath = path.join(__dirname, '..', 'backend', 'dist', binaryName);
  if (fs.existsSync(devPath)) {
    return devPath;
  }
  return null;
}

function startBackend() {
  const isPackaged = app.isPackaged;
  const userDataDir = app.getPath('userData');
  const dbPath = path.join(userDataDir, 'leads.db');

  try {
    if (isPackaged) {
      // Production: try bundled binary first, then system Python
      const bundledBinary = getBundledBackendPath();

      if (bundledBinary) {
        console.log(`[Backend] Using bundled binary: ${bundledBinary}`);
        // Make sure the binary is executable on Unix
        if (process.platform !== 'win32') {
          try { fs.chmodSync(bundledBinary, 0o755); } catch { /* ignore */ }
        }
        backendProcess = spawn(bundledBinary, [], {
          cwd: userDataDir,
          env: { ...process.env, DATABASE_PATH: dbPath },
        });
      } else {
        // Fallback: find system Python
        console.log('[Backend] No bundled binary found, trying system Python...');
        const pythonCmd = findPython();
        const backendDir = path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');
        const backendDirFallback = path.join(__dirname, '..', 'backend');
        const actualBackendDir = fs.existsSync(backendDir) ? backendDir : backendDirFallback;

        if (!pythonCmd) {
          console.error('[Backend] Python not found on this system');
          // Show dialog after window is ready
          if (mainWindow) {
            showPythonRequiredDialog();
          } else {
            app.once('browser-window-created', () => {
              setTimeout(showPythonRequiredDialog, 2000);
            });
          }
          return;
        }

        // Auto-install dependencies if needed
        const depsOk = installBackendDeps(pythonCmd, actualBackendDir);
        if (!depsOk) {
          console.error('[Backend] Could not install dependencies. Extraction features will be unavailable.');
        }

        backendProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
          cwd: actualBackendDir,
          env: { ...process.env, DATABASE_PATH: dbPath },
          shell: process.platform === 'win32',
        });
      }
    } else {
      // In development, use poetry
      const backendDir = path.join(__dirname, '..', 'backend');
      backendProcess = spawn('poetry', ['run', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendDir,
        env: { ...process.env },
      });
    }

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log(`[Backend] ${msg}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        backendReady = true;
        console.log('[Backend] Server is ready');
        // Notify renderer that backend is ready
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('backend-ready');
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const msg = data.toString();
      console.error(`[Backend] ${msg}`);
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        backendReady = true;
        console.log('[Backend] Server is ready');
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('backend-ready');
        }
      }
    });

    backendProcess.on('error', (err) => {
      console.error(`[Backend] Failed to start: ${err.message}`);
      backendProcess = null;
      // Only show Python dialog if no bundled binary was found
      if (!getBundledBackendPath()) {
        setTimeout(showPythonRequiredDialog, 1000);
      }
    });

    backendProcess.on('close', (code) => {
      console.log(`[Backend] Process exited with code ${code}`);
      backendReady = false;
    });
  } catch (err) {
    console.error(`[Backend] Failed to start backend: ${err.message}`);
    backendProcess = null;
  }
}

function stopBackend() {
  if (backendProcess) {
    try {
      backendProcess.kill('SIGTERM');
      // Force kill after 3 seconds if still running
      const proc = backendProcess;
      setTimeout(() => {
        try { proc.kill('SIGKILL'); } catch { /* already dead */ }
      }, 3000);
    } catch { /* already dead */ }
    backendProcess = null;
    backendReady = false;
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
  isQuitting = true;
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
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
              role: result.role || 'user',
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
