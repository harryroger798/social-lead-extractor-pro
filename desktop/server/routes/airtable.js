const express = require('express');
const { getDatabase, getSetting } = require('../database/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { SYNC_STATUS } = require('../config/constants');
const airtableSync = require('../services/airtableSync');

const router = express.Router();

router.get('/status', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const lastSync = db.prepare(`
    SELECT * FROM sync_history
    ORDER BY synced_at DESC
    LIMIT 1
  `).get();
  
  const syncEnabled = getSetting('airtable_sync_enabled') === '1';
  const syncInterval = parseInt(getSetting('airtable_sync_interval') || '30');
  const hasApiKey = !!getSetting('airtable_api_key');
  const hasBaseId = !!getSetting('airtable_base_id');
  
  const pendingSync = {
    customers: db.prepare('SELECT COUNT(*) as count FROM customers WHERE synced_to_airtable = 0').get().count,
    repairs: db.prepare('SELECT COUNT(*) as count FROM repairs WHERE synced_to_airtable = 0').get().count,
    invoices: db.prepare('SELECT COUNT(*) as count FROM invoices WHERE synced_to_airtable = 0').get().count,
    digital_services: db.prepare('SELECT COUNT(*) as count FROM digital_services WHERE synced_to_airtable = 0').get().count
  };
  
  const totalPending = Object.values(pendingSync).reduce((sum, count) => sum + count, 0);
  
  res.json({
    success: true,
    data: {
      enabled: syncEnabled,
      configured: hasApiKey && hasBaseId,
      sync_interval_minutes: syncInterval,
      last_sync: lastSync ? {
        table: lastSync.table_name,
        records_synced: lastSync.records_synced,
        status: lastSync.status,
        synced_at: lastSync.synced_at,
        error: lastSync.error_message
      } : null,
      pending_sync: pendingSync,
      total_pending: totalPending
    }
  });
}));

router.post('/sync-now', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { tables } = req.body;
  
  const syncEnabled = getSetting('airtable_sync_enabled') === '1';
  const apiKey = getSetting('airtable_api_key');
  const baseId = getSetting('airtable_base_id');
  
  if (!apiKey || !baseId) {
    return res.status(400).json({
      success: false,
      error: 'Airtable not configured',
      message: 'Please configure Airtable API key and Base ID in settings'
    });
  }
  
  if (!syncEnabled) {
    return res.status(400).json({
      success: false,
      error: 'Sync disabled',
      message: 'Airtable sync is currently disabled. Enable it in settings.'
    });
  }
  
  try {
    const results = await airtableSync.syncAll(tables);
    
    logActivity(req.user.id, ACTIVITY_ACTIONS.SYNC, 'airtable', null, null, results, req);
    
    res.json({
      success: true,
      message: 'Sync completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Sync failed',
      message: error.message
    });
  }
}));

router.get('/sync-history', authenticate, asyncHandler(async (req, res) => {
  const { limit = 50, table_name, status } = req.query;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (table_name) {
    whereClause += ' AND table_name = ?';
    params.push(table_name);
  }
  
  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }
  
  const history = db.prepare(`
    SELECT * FROM sync_history
    WHERE ${whereClause}
    ORDER BY synced_at DESC
    LIMIT ?
  `).all(...params, parseInt(limit));
  
  const summary = db.prepare(`
    SELECT 
      table_name,
      COUNT(*) as total_syncs,
      SUM(records_synced) as total_records,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM sync_history
    GROUP BY table_name
  `).all();
  
  res.json({
    success: true,
    data: history,
    summary
  });
}));

router.post('/test-connection', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const apiKey = getSetting('airtable_api_key');
  const baseId = getSetting('airtable_base_id');
  
  if (!apiKey || !baseId) {
    return res.status(400).json({
      success: false,
      error: 'Airtable not configured',
      message: 'Please configure Airtable API key and Base ID in settings'
    });
  }
  
  try {
    const result = await airtableSync.testConnection();
    
    res.json({
      success: true,
      message: 'Connection successful',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Connection failed',
      message: error.message
    });
  }
}));

router.get('/tables', authenticate, asyncHandler(async (req, res) => {
  const tables = [
    { name: 'customers', display: 'Customers', description: 'Customer records' },
    { name: 'repairs', display: 'Repairs', description: 'Repair tickets' },
    { name: 'invoices', display: 'Invoices', description: 'Invoice records' },
    { name: 'digital_services', display: 'Digital Services', description: 'Digital service projects' }
  ];
  
  const db = getDatabase();
  
  const tablesWithStats = tables.map(table => {
    const total = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get().count;
    const synced = db.prepare(`SELECT COUNT(*) as count FROM ${table.name} WHERE synced_to_airtable = 1`).get().count;
    const pending = total - synced;
    
    return {
      ...table,
      total_records: total,
      synced_records: synced,
      pending_records: pending,
      sync_percentage: total > 0 ? Math.round((synced / total) * 100) : 100
    };
  });
  
  res.json({
    success: true,
    data: tablesWithStats
  });
}));

router.post('/reset-sync-flags', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { table } = req.body;
  const db = getDatabase();
  
  const allowedTables = ['customers', 'repairs', 'invoices', 'digital_services'];
  
  if (table && !allowedTables.includes(table)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid table name'
    });
  }
  
  if (table) {
    db.prepare(`UPDATE ${table} SET synced_to_airtable = 0`).run();
  } else {
    allowedTables.forEach(t => {
      db.prepare(`UPDATE ${t} SET synced_to_airtable = 0`).run();
    });
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'airtable', null, null, { action: 'reset_sync_flags', table: table || 'all' }, req);
  
  res.json({
    success: true,
    message: table ? `Sync flags reset for ${table}` : 'All sync flags reset'
  });
}));

module.exports = router;
