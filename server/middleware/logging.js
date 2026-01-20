const morgan = require('morgan');
const { logger } = require('./errorHandler');
const { getDatabase } = require('../database/db');
const { ACTIVITY_ACTIONS } = require('../config/constants');

const morganFormat = process.env.NODE_ENV === 'production' 
  ? 'combined' 
  : 'dev';

const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

function logActivity(userId, action, tableName, recordId, oldValues = null, newValues = null, req = null) {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO activity_log (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      userId,
      action,
      tableName,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      req?.ip || null,
      req?.get('User-Agent') || null
    );
  } catch (error) {
    logger.error('Failed to log activity:', error);
  }
}

function activityLogger(tableName, action) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
        const recordId = data.data?.id || req.params.id;
        logActivity(
          req.user?.id,
          action,
          tableName,
          recordId,
          req.body._oldValues,
          req.body,
          req
        );
      }
      return originalJson(data);
    };
    
    next();
  };
}

function getActivityLogs(filters = {}) {
  const db = getDatabase();
  let query = `
    SELECT 
      al.*,
      u.username,
      u.email as user_email
    FROM activity_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  
  if (filters.userId) {
    query += ' AND al.user_id = ?';
    params.push(filters.userId);
  }
  
  if (filters.action) {
    query += ' AND al.action = ?';
    params.push(filters.action);
  }
  
  if (filters.tableName) {
    query += ' AND al.table_name = ?';
    params.push(filters.tableName);
  }
  
  if (filters.recordId) {
    query += ' AND al.record_id = ?';
    params.push(filters.recordId);
  }
  
  if (filters.dateFrom) {
    query += ' AND al.created_at >= ?';
    params.push(filters.dateFrom);
  }
  
  if (filters.dateTo) {
    query += ' AND al.created_at <= ?';
    params.push(filters.dateTo);
  }
  
  query += ' ORDER BY al.created_at DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }
  
  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }
  
  return db.prepare(query).all(...params);
}

module.exports = {
  requestLogger,
  logActivity,
  activityLogger,
  getActivityLogs,
  ACTIVITY_ACTIONS
};
