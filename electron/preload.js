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
});
