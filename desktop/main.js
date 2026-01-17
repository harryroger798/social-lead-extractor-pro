const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let mainWindow

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
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
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'))
  }

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

app.whenReady().then(() => {
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
