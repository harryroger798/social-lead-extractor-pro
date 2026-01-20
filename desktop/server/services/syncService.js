const axios = require('axios');
const { getDatabase } = require('../database/db');

const REMOTE_API_URL = 'http://167.71.237.250/api';
let syncStatus = 'idle';
let lastSyncTime = null;
let syncInterval = null;

function getSyncStatus() {
  return {
    status: syncStatus,
    lastSyncTime: lastSyncTime,
    isOnline: isOnline
  };
}

let isOnline = false;

async function checkConnectivity() {
  try {
    const response = await axios.get(`${REMOTE_API_URL}/health`, { timeout: 5000 });
    isOnline = response.status === 200;
    return isOnline;
  } catch (error) {
    isOnline = false;
    return false;
  }
}

async function syncTable(tableName, primaryKey = 'id') {
  const db = getDatabase();
  
  try {
    const localRecords = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    const response = await axios.get(`${REMOTE_API_URL}/sync/${tableName}`, {
      timeout: 30000,
      headers: { 'X-Sync-Request': 'true' }
    });
    
    if (!response.data.success) {
      console.log(`Sync endpoint not available for ${tableName}`);
      return { synced: 0, errors: 0 };
    }
    
    const remoteRecords = response.data.data || [];
    
    let synced = 0;
    let errors = 0;
    
    const localMap = new Map(localRecords.map(r => [r[primaryKey], r]));
    const remoteMap = new Map(remoteRecords.map(r => [r[primaryKey], r]));
    
    for (const remoteRecord of remoteRecords) {
      const localRecord = localMap.get(remoteRecord[primaryKey]);
      
      if (!localRecord) {
        try {
          const columns = Object.keys(remoteRecord).join(', ');
          const placeholders = Object.keys(remoteRecord).map(() => '?').join(', ');
          const values = Object.values(remoteRecord);
          
          db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`).run(...values);
          synced++;
        } catch (err) {
          console.error(`Error inserting ${tableName} record:`, err.message);
          errors++;
        }
      } else {
        const remoteUpdated = new Date(remoteRecord.updated_at || remoteRecord.created_at || 0);
        const localUpdated = new Date(localRecord.updated_at || localRecord.created_at || 0);
        
        if (remoteUpdated > localUpdated) {
          try {
            const columns = Object.keys(remoteRecord).join(', ');
            const placeholders = Object.keys(remoteRecord).map(() => '?').join(', ');
            const values = Object.values(remoteRecord);
            
            db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`).run(...values);
            synced++;
          } catch (err) {
            console.error(`Error updating ${tableName} record:`, err.message);
            errors++;
          }
        }
      }
    }
    
    for (const localRecord of localRecords) {
      const remoteRecord = remoteMap.get(localRecord[primaryKey]);
      
      if (!remoteRecord || (localRecord.updated_at && new Date(localRecord.updated_at) > new Date(remoteRecord.updated_at || 0))) {
        try {
          await axios.post(`${REMOTE_API_URL}/sync/${tableName}`, localRecord, {
            timeout: 10000,
            headers: { 'X-Sync-Request': 'true' }
          });
          synced++;
        } catch (err) {
          console.log(`Could not push ${tableName} record to remote:`, err.message);
        }
      }
    }
    
    return { synced, errors };
  } catch (error) {
    console.error(`Error syncing ${tableName}:`, error.message);
    return { synced: 0, errors: 1 };
  }
}

async function syncAll() {
  if (syncStatus === 'syncing') {
    console.log('Sync already in progress');
    return;
  }
  
  const online = await checkConnectivity();
  if (!online) {
    console.log('Offline - skipping sync');
    syncStatus = 'offline';
    return;
  }
  
  syncStatus = 'syncing';
  console.log('Starting sync...');
  
  const tables = [
    { name: 'customers', key: 'id' },
    { name: 'repairs', key: 'id' },
    { name: 'invoices', key: 'id' },
    { name: 'services', key: 'id' },
    { name: 'settings', key: 'key' }
  ];
  
  let totalSynced = 0;
  let totalErrors = 0;
  
  for (const table of tables) {
    const result = await syncTable(table.name, table.key);
    totalSynced += result.synced;
    totalErrors += result.errors;
  }
  
  lastSyncTime = new Date().toISOString();
  syncStatus = totalErrors > 0 ? 'error' : 'synced';
  
  console.log(`Sync completed: ${totalSynced} records synced, ${totalErrors} errors`);
  
  return { synced: totalSynced, errors: totalErrors };
}

function startAutoSync(intervalMinutes = 5) {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncAll();
  
  syncInterval = setInterval(() => {
    syncAll();
  }, intervalMinutes * 60 * 1000);
  
  console.log(`Auto-sync started (every ${intervalMinutes} minutes)`);
}

function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

module.exports = {
  syncAll,
  syncTable,
  checkConnectivity,
  getSyncStatus,
  startAutoSync,
  stopAutoSync
};
