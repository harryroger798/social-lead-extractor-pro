const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('../database/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { BACKUP_TYPES } = require('../config/constants');

const router = express.Router();

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

router.post('/create', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { backup_type = BACKUP_TYPES.MANUAL, tables } = req.body;
  const db = getDatabase();
  
  const allTables = ['users', 'customers', 'services', 'repairs', 'mobile_repairs', 'digital_services', 'invoices', 'payments', 'settings', 'activity_log', 'omnisend_log', 'sync_history', 'phone_models'];
  const tablesToBackup = tables || allTables;
  
  const backupData = {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    created_by: req.user.username,
    backup_type,
    tables: {}
  };
  
  let totalRecords = 0;
  
  for (const table of tablesToBackup) {
    try {
      const data = db.prepare(`SELECT * FROM ${table}`).all();
      backupData.tables[table] = data;
      totalRecords += data.length;
    } catch (error) {
      backupData.tables[table] = { error: error.message };
    }
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup_${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
  
  const stats = fs.statSync(filepath);
  
  db.prepare(`
    INSERT INTO backups (filename, file_path, file_size, backup_type, tables_included, records_count, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(filename, filepath, stats.size, backup_type, tablesToBackup.join(','), totalRecords, req.user.id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'backups', null, null, { filename, records: totalRecords }, req);
  
  res.json({
    success: true,
    message: 'Backup created successfully',
    data: {
      filename,
      file_size: stats.size,
      records_count: totalRecords,
      tables_included: tablesToBackup,
      created_at: backupData.created_at
    }
  });
}));

router.get('/list', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const db = getDatabase();
  
  const backups = db.prepare(`
    SELECT b.*, u.username as created_by_name
    FROM backups b
    LEFT JOIN users u ON b.created_by = u.id
    ORDER BY b.created_at DESC
    LIMIT ?
  `).all(parseInt(limit));
  
  const backupsWithStatus = backups.map(backup => ({
    ...backup,
    file_exists: fs.existsSync(backup.file_path)
  }));
  
  res.json({
    success: true,
    data: backupsWithStatus
  });
}));

router.get('/download/:filename', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const db = getDatabase();
  
  const backup = db.prepare('SELECT * FROM backups WHERE filename = ?').get(filename);
  
  if (!backup) {
    throw new NotFoundError('Backup');
  }
  
  if (!fs.existsSync(backup.file_path)) {
    return res.status(404).json({
      success: false,
      error: 'Backup file not found',
      message: 'The backup file has been deleted from the server'
    });
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.VIEW, 'backups', backup.id, null, { action: 'download' }, req);
  
  res.download(backup.file_path, filename);
}));

router.delete('/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id);
  
  if (!backup) {
    throw new NotFoundError('Backup');
  }
  
  if (fs.existsSync(backup.file_path)) {
    fs.unlinkSync(backup.file_path);
  }
  
  db.prepare('DELETE FROM backups WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'backups', id, backup, null, req);
  
  res.json({
    success: true,
    message: 'Backup deleted successfully'
  });
}));

router.post('/restore/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tables, confirm } = req.body;
  const db = getDatabase();
  
  if (!confirm) {
    return res.status(400).json({
      success: false,
      error: 'Confirmation required',
      message: 'Please set confirm: true to proceed with restore. This will overwrite existing data.'
    });
  }
  
  const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id);
  
  if (!backup) {
    throw new NotFoundError('Backup');
  }
  
  if (!fs.existsSync(backup.file_path)) {
    return res.status(404).json({
      success: false,
      error: 'Backup file not found',
      message: 'The backup file has been deleted from the server'
    });
  }
  
  const backupData = JSON.parse(fs.readFileSync(backup.file_path, 'utf8'));
  
  const tablesToRestore = tables || Object.keys(backupData.tables);
  const results = {};
  
  for (const table of tablesToRestore) {
    if (!backupData.tables[table] || backupData.tables[table].error) {
      results[table] = { success: false, error: 'Table not in backup or had errors' };
      continue;
    }
    
    try {
      const records = backupData.tables[table];
      
      if (records.length === 0) {
        results[table] = { success: true, records: 0 };
        continue;
      }
      
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(', ');
      
      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO ${table} (${columns.join(', ')})
        VALUES (${placeholders})
      `);
      
      const insertMany = db.transaction((items) => {
        for (const item of items) {
          insertStmt.run(...columns.map(col => item[col]));
        }
      });
      
      insertMany(records);
      results[table] = { success: true, records: records.length };
    } catch (error) {
      results[table] = { success: false, error: error.message };
    }
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'backups', id, null, { action: 'restore', results }, req);
  
  res.json({
    success: true,
    message: 'Restore completed',
    data: {
      backup_date: backupData.created_at,
      results
    }
  });
}));

router.post('/cleanup', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { days_to_keep = 30 } = req.body;
  const db = getDatabase();
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days_to_keep);
  
  const oldBackups = db.prepare(`
    SELECT * FROM backups
    WHERE created_at < ? AND backup_type != 'manual'
  `).all(cutoffDate.toISOString());
  
  let deletedCount = 0;
  let freedSpace = 0;
  
  for (const backup of oldBackups) {
    if (fs.existsSync(backup.file_path)) {
      freedSpace += backup.file_size;
      fs.unlinkSync(backup.file_path);
    }
    db.prepare('DELETE FROM backups WHERE id = ?').run(backup.id);
    deletedCount++;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'backups', null, null, { action: 'cleanup', deleted: deletedCount }, req);
  
  res.json({
    success: true,
    message: `Cleanup completed. Deleted ${deletedCount} old backups.`,
    data: {
      deleted_count: deletedCount,
      freed_space_bytes: freedSpace,
      freed_space_mb: Math.round(freedSpace / 1024 / 1024 * 100) / 100
    }
  });
}));

router.get('/stats', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_backups,
      SUM(file_size) as total_size,
      SUM(records_count) as total_records,
      MAX(created_at) as last_backup
    FROM backups
  `).get();
  
  const byType = db.prepare(`
    SELECT backup_type, COUNT(*) as count
    FROM backups
    GROUP BY backup_type
  `).all();
  
  let actualSize = 0;
  if (fs.existsSync(BACKUP_DIR)) {
    const files = fs.readdirSync(BACKUP_DIR);
    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const fileStat = fs.statSync(filePath);
      actualSize += fileStat.size;
    }
  }
  
  res.json({
    success: true,
    data: {
      total_backups: stats.total_backups,
      total_size_bytes: stats.total_size || 0,
      total_size_mb: Math.round((stats.total_size || 0) / 1024 / 1024 * 100) / 100,
      actual_disk_usage_mb: Math.round(actualSize / 1024 / 1024 * 100) / 100,
      total_records_backed_up: stats.total_records || 0,
      last_backup: stats.last_backup,
      by_type: byType
    }
  });
}));

module.exports = router;
