const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  platform: process.platform,
  // License management
  licenseGet: () => ipcRenderer.invoke('license-get'),
  licenseSave: (data) => ipcRenderer.invoke('license-save', data),
  licenseRemove: () => ipcRenderer.invoke('license-remove'),
  licenseGetDeviceId: () => ipcRenderer.invoke('license-get-device-id'),
  licenseActivateOnline: (key) => ipcRenderer.invoke('license-activate-online', key),
  // v3.5.34: Backend readiness callback via IPC
  onBackendReady: (callback) => ipcRenderer.on('backend-ready', callback),
  removeBackendReadyListener: (callback) => ipcRenderer.removeListener('backend-ready', callback),
});
