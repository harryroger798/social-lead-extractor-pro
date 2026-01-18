const { app, BrowserWindow, Menu, shell, ipcMain, dialog, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const { autoUpdater } = require('electron-updater')

let mainWindow
let server = null
let serverPort = 3001

const isDev = process.env.NODE_ENV === 'development'

function getUserDataPath() {
  return app.getPath('userData')
}

function setupDatabase() {
  const userDataPath = getUserDataPath()
  const dbPath = path.join(userDataPath, 'bytecare.db')
  
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  process.env.DATABASE_PATH = dbPath
  
  const logsDir = path.join(userDataPath, 'logs')
  const backupsDir = path.join(userDataPath, 'backups')
  const generatedDir = path.join(userDataPath, 'generated')
  
  ;[logsDir, backupsDir, generatedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
  
  return dbPath
}

async function startEmbeddedServer() {
  return new Promise((resolve, reject) => {
    try {
      const dbPath = setupDatabase()
      console.log('Database path:', dbPath)
      
      const { setDatabasePath, initializeDatabase, getSetting } = require('./server/database/db')
      setDatabasePath(dbPath)
      initializeDatabase()
      
      const express = require('express')
      const cors = require('cors')
      const helmet = require('helmet')
      const compression = require('compression')
      
      const authRoutes = require('./server/routes/auth')
      const customerRoutes = require('./server/routes/customers')
      const repairRoutes = require('./server/routes/repairs')
      const serviceRoutes = require('./server/routes/services')
      const invoiceRoutes = require('./server/routes/invoices')
      const dashboardRoutes = require('./server/routes/dashboard')
      const settingsRoutes = require('./server/routes/settings')
      const digitalServiceRoutes = require('./server/routes/digitalServices')
      const exportRoutes = require('./server/routes/exports')
      const backupRoutes = require('./server/routes/backup')
      
      const { startAutoSync, getSyncStatus } = require('./server/services/syncService')
      
      const serverApp = express()
      
      serverApp.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false
      }))
      
      serverApp.use(cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
      }))
      
      serverApp.use(compression())
      serverApp.use(express.json({ limit: '10mb' }))
      serverApp.use(express.urlencoded({ extended: true, limit: '10mb' }))
      
      serverApp.get('/api/health', (req, res) => {
        res.json({
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'desktop',
          database: 'connected',
          uptime: process.uptime()
        })
      })
      
      serverApp.get('/api/sync/status', (req, res) => {
        res.json({
          success: true,
          data: getSyncStatus()
        })
      })
      
      serverApp.get('/api/info', (req, res) => {
        const businessName = getSetting('business_name') || 'ByteCare'
        const businessPhone = getSetting('business_phone') || ''
        const businessEmail = getSetting('business_email') || ''
        const themeColor = getSetting('theme_color') || '#2563eb'
        
        res.json({
          success: true,
          data: {
            name: businessName,
            phone: businessPhone,
            email: businessEmail,
            theme_color: themeColor,
            version: '1.0.0',
            isDesktop: true
          }
        })
      })
      
      serverApp.use('/api/auth', authRoutes)
      serverApp.use('/api/customers', customerRoutes)
      serverApp.use('/api/repairs', repairRoutes)
      serverApp.use('/api/services', serviceRoutes)
      serverApp.use('/api/invoices', invoiceRoutes)
      serverApp.use('/api/dashboard', dashboardRoutes)
      serverApp.use('/api/settings', settingsRoutes)
      serverApp.use('/api/digital-services', digitalServiceRoutes)
      serverApp.use('/api/exports', exportRoutes)
      serverApp.use('/api/backup', backupRoutes)
      
      const userDataPath = getUserDataPath()
      serverApp.use('/generated', express.static(path.join(userDataPath, 'generated')))
      
      serverApp.use((req, res) => {
        res.status(404).json({ success: false, error: 'Not found' })
      })
      
      serverApp.use((err, req, res, next) => {
        console.error('Server error:', err)
        res.status(500).json({ success: false, error: 'Internal server error' })
      })
      
      server = serverApp.listen(serverPort, '127.0.0.1', () => {
        console.log(`Embedded server running on http://127.0.0.1:${serverPort}`)
        startAutoSync(5)
        resolve(serverPort)
      })
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          serverPort++
          console.log(`Port in use, trying ${serverPort}`)
          server = serverApp.listen(serverPort, '127.0.0.1', () => {
            console.log(`Embedded server running on http://127.0.0.1:${serverPort}`)
            startAutoSync(5)
            resolve(serverPort)
          })
        } else {
          reject(err)
        }
      })
      
    } catch (error) {
      console.error('Failed to start embedded server:', error)
      reject(error)
    }
  })
}

function registerCustomProtocol() {
  protocol.handle('bytecare', (request) => {
    let url = request.url.replace('bytecare://', '')
    if (url === '' || url === './') {
      url = 'index.html'
    }
    url = url.replace(/^\.\//, '')
    const filePath = path.join(__dirname, 'renderer', url)
    return net.fetch('file://' + filePath)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'ByteCare - Repair Shop Management',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadURL('bytecare://./index.html')
  }

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  createMenu()
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Repair',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-repair')
          }
        },
        {
          label: 'New Customer',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-action', 'new-customer')
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          submenu: [
            {
              label: 'Export Repairs (CSV)',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-repairs')
              }
            },
            {
              label: 'Export Invoices (CSV)',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-invoices')
              }
            },
            {
              label: 'Export Customers (CSV)',
              click: () => {
                mainWindow.webContents.send('menu-action', 'export-customers')
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Backup Database',
          click: () => {
            mainWindow.webContents.send('menu-action', 'backup')
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('navigate', '/')
          }
        },
        {
          label: 'Customers',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('navigate', '/customers')
          }
        },
        {
          label: 'Repairs',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('navigate', '/repairs')
          }
        },
        {
          label: 'Invoices',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.send('navigate', '/invoices')
          }
        },
        {
          label: 'Services',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            mainWindow.webContents.send('navigate', '/services')
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://docs.bytecare.com')
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/harryroger798/Test/issues')
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify()
          }
        },
        { type: 'separator' },
        {
          label: 'About ByteCare',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ByteCare',
              message: 'ByteCare - Repair Shop Management System',
              detail: `Version: ${app.getVersion()}\n\nA complete repair shop management solution for PC repair, mobile repair, and digital services.\n\nOwner: Sayan Roy Chowdhury\nEmail: harryroger798@gmail.com`
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(async () => {
  registerCustomProtocol()
  
  try {
    await startEmbeddedServer()
    console.log('Embedded server started successfully')
  } catch (error) {
    console.error('Failed to start embedded server:', error)
    dialog.showErrorBox('Server Error', 'Failed to start the local server. The application may not work correctly.')
  }
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (server) {
    server.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version of ByteCare is available. It will be downloaded in the background.'
  })
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'A new version has been downloaded. Restart the application to apply the update.',
    buttons: ['Restart', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options)
  return result
})

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options)
  return result
})

ipcMain.handle('get-server-port', () => {
  return serverPort
})

ipcMain.handle('get-user-data-path', () => {
  return getUserDataPath()
})
