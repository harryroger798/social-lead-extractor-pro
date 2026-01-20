const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getServerPort: () => ipcRenderer.invoke('get-server-port'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (event, action) => callback(action)),
  onNavigate: (callback) => ipcRenderer.on('navigate', (event, path) => callback(path)),
  removeMenuActionListener: () => ipcRenderer.removeAllListeners('menu-action'),
  removeNavigateListener: () => ipcRenderer.removeAllListeners('navigate'),
  isElectron: true
})
