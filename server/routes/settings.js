const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase, getSetting, setSetting } = require('../database/db');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');

const router = express.Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const settings = db.prepare(`
    SELECT key, value, category, description, is_secret, updated_at
    FROM settings
    ORDER BY category, key
  `).all();
  
  const grouped = {};
  settings.forEach(setting => {
    if (!grouped[setting.category]) {
      grouped[setting.category] = {};
    }
    grouped[setting.category][setting.key] = setting.is_secret ? '********' : setting.value;
  });
  
  const settingsMap = {};
  settings.forEach(setting => {
    settingsMap[setting.key] = setting.is_secret ? '********' : setting.value;
  });
  
  res.json({
    success: true,
    data: settingsMap,
    grouped
  });
}));

router.get('/public', asyncHandler(async (req, res) => {
  const publicSettings = {
    business_name: getSetting('business_name'),
    business_city: getSetting('business_city'),
    theme_color: getSetting('theme_color'),
    logo_url: getSetting('logo_url'),
    gst_registered: getSetting('gst_registered') === '1'
  };
  
  res.json({
    success: true,
    data: publicSettings
  });
}));

router.get('/category/:category', authenticate, asyncHandler(async (req, res) => {
  const { category } = req.params;
  const db = getDatabase();
  
  const settings = db.prepare(`
    SELECT key, value, description, is_secret, updated_at
    FROM settings
    WHERE category = ?
    ORDER BY key
  `).all(category);
  
  if (settings.length === 0) {
    return res.json({
      success: true,
      data: {},
      message: 'No settings found for this category'
    });
  }
  
  const settingsMap = {};
  settings.forEach(setting => {
    settingsMap[setting.key] = setting.is_secret && req.user.role !== 'admin' ? '********' : setting.value;
  });
  
  res.json({
    success: true,
    data: settingsMap,
    category
  });
}));

router.put('/', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const updates = req.body;
  const db = getDatabase();
  
  const allowedKeys = db.prepare('SELECT key FROM settings').all().map(s => s.key);
  
  const updatedSettings = {};
  const errors = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (!allowedKeys.includes(key)) {
      errors.push(`Unknown setting: ${key}`);
      continue;
    }
    
    const oldValue = getSetting(key);
    setSetting(key, value, req.user.id);
    updatedSettings[key] = value;
    
    logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, { [key]: oldValue }, { [key]: value }, req);
  }
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: updatedSettings,
    errors: errors.length > 0 ? errors : undefined
  });
}));

router.put('/business', authenticate, isAdmin, [
  body('business_name').optional().trim().isLength({ min: 1, max: 200 }),
  body('owner_name').optional().trim().isLength({ min: 1, max: 200 }),
  body('business_phone').optional().trim(),
  body('business_email').optional().trim().isEmail(),
  body('business_address').optional().trim(),
  body('business_city').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { business_name, owner_name, business_phone, business_email, business_address, business_city } = req.body;
  
  const updates = {};
  
  if (business_name !== undefined) {
    setSetting('business_name', business_name, req.user.id);
    updates.business_name = business_name;
  }
  if (owner_name !== undefined) {
    setSetting('owner_name', owner_name, req.user.id);
    updates.owner_name = owner_name;
  }
  if (business_phone !== undefined) {
    setSetting('business_phone', business_phone, req.user.id);
    updates.business_phone = business_phone;
  }
  if (business_email !== undefined) {
    setSetting('business_email', business_email, req.user.id);
    updates.business_email = business_email;
  }
  if (business_address !== undefined) {
    setSetting('business_address', business_address, req.user.id);
    updates.business_address = business_address;
  }
  if (business_city !== undefined) {
    setSetting('business_city', business_city, req.user.id);
    updates.business_city = business_city;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, updates, req);
  
  res.json({
    success: true,
    message: 'Business settings updated successfully',
    data: updates
  });
}));

router.post('/gst-activate', authenticate, isAdmin, [
  body('gst_number')
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { gst_number } = req.body;
  
  setSetting('gst_number', gst_number, req.user.id);
  setSetting('gst_registered', '1', req.user.id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, { gst_number, gst_registered: true }, req);
  
  res.json({
    success: true,
    message: 'GST registration activated successfully',
    data: {
      gst_number,
      gst_registered: true
    }
  });
}));

router.post('/gst-deactivate', authenticate, isAdmin, asyncHandler(async (req, res) => {
  setSetting('gst_registered', '0', req.user.id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, { gst_registered: false }, req);
  
  res.json({
    success: true,
    message: 'GST registration deactivated',
    data: {
      gst_registered: false
    }
  });
}));

router.put('/payment', authenticate, isAdmin, [
  body('bank_account').optional().trim(),
  body('bank_name').optional().trim(),
  body('bank_ifsc').optional().trim(),
  body('upi_id').optional().trim()
], asyncHandler(async (req, res) => {
  const { bank_account, bank_name, bank_ifsc, upi_id } = req.body;
  
  const updates = {};
  
  if (bank_account !== undefined) {
    setSetting('bank_account', bank_account, req.user.id);
    updates.bank_account = bank_account;
  }
  if (bank_name !== undefined) {
    setSetting('bank_name', bank_name, req.user.id);
    updates.bank_name = bank_name;
  }
  if (bank_ifsc !== undefined) {
    setSetting('bank_ifsc', bank_ifsc, req.user.id);
    updates.bank_ifsc = bank_ifsc;
  }
  if (upi_id !== undefined) {
    setSetting('upi_id', upi_id, req.user.id);
    updates.upi_id = upi_id;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, updates, req);
  
  res.json({
    success: true,
    message: 'Payment settings updated successfully',
    data: updates
  });
}));

router.put('/integrations', authenticate, isAdmin, [
  body('airtable_api_key').optional().trim(),
  body('airtable_base_id').optional().trim(),
  body('airtable_sync_enabled').optional().isBoolean(),
  body('airtable_sync_interval').optional().isInt({ min: 5, max: 1440 }),
  body('omnisend_api_key').optional().trim(),
  body('omnisend_enabled').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    airtable_api_key, 
    airtable_base_id, 
    airtable_sync_enabled, 
    airtable_sync_interval,
    omnisend_api_key,
    omnisend_enabled
  } = req.body;
  
  const updates = {};
  
  if (airtable_api_key !== undefined) {
    setSetting('airtable_api_key', airtable_api_key, req.user.id);
    updates.airtable_api_key = '********';
  }
  if (airtable_base_id !== undefined) {
    setSetting('airtable_base_id', airtable_base_id, req.user.id);
    updates.airtable_base_id = airtable_base_id;
  }
  if (airtable_sync_enabled !== undefined) {
    setSetting('airtable_sync_enabled', airtable_sync_enabled ? '1' : '0', req.user.id);
    updates.airtable_sync_enabled = airtable_sync_enabled;
  }
  if (airtable_sync_interval !== undefined) {
    setSetting('airtable_sync_interval', airtable_sync_interval.toString(), req.user.id);
    updates.airtable_sync_interval = airtable_sync_interval;
  }
  if (omnisend_api_key !== undefined) {
    setSetting('omnisend_api_key', omnisend_api_key, req.user.id);
    updates.omnisend_api_key = '********';
  }
  if (omnisend_enabled !== undefined) {
    setSetting('omnisend_enabled', omnisend_enabled ? '1' : '0', req.user.id);
    updates.omnisend_enabled = omnisend_enabled;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, { integration_settings_updated: true }, req);
  
  res.json({
    success: true,
    message: 'Integration settings updated successfully',
    data: updates
  });
}));

router.put('/notifications', authenticate, isAdmin, [
  body('auto_send_invoice_email').optional().isBoolean(),
  body('auto_send_invoice_sms').optional().isBoolean(),
  body('payment_reminder_days').optional().isInt({ min: 1, max: 30 })
], asyncHandler(async (req, res) => {
  const { auto_send_invoice_email, auto_send_invoice_sms, payment_reminder_days } = req.body;
  
  const updates = {};
  
  if (auto_send_invoice_email !== undefined) {
    setSetting('auto_send_invoice_email', auto_send_invoice_email ? '1' : '0', req.user.id);
    updates.auto_send_invoice_email = auto_send_invoice_email;
  }
  if (auto_send_invoice_sms !== undefined) {
    setSetting('auto_send_invoice_sms', auto_send_invoice_sms ? '1' : '0', req.user.id);
    updates.auto_send_invoice_sms = auto_send_invoice_sms;
  }
  if (payment_reminder_days !== undefined) {
    setSetting('payment_reminder_days', payment_reminder_days.toString(), req.user.id);
    updates.payment_reminder_days = payment_reminder_days;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, updates, req);
  
  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: updates
  });
}));

router.put('/branding', authenticate, isAdmin, [
  body('logo_url').optional().trim(),
  body('theme_color').optional().trim().matches(/^#[0-9A-Fa-f]{6}$/)
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { logo_url, theme_color } = req.body;
  
  const updates = {};
  
  if (logo_url !== undefined) {
    setSetting('logo_url', logo_url, req.user.id);
    updates.logo_url = logo_url;
  }
  if (theme_color !== undefined) {
    setSetting('theme_color', theme_color, req.user.id);
    updates.theme_color = theme_color;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, updates, req);
  
  res.json({
    success: true,
    message: 'Branding settings updated successfully',
    data: updates
  });
}));

router.put('/service', authenticate, isAdmin, [
  body('warranty_days').optional().isInt({ min: 0, max: 365 }),
  body('invoice_prefix').optional().trim()
], asyncHandler(async (req, res) => {
  const { warranty_days, invoice_prefix } = req.body;
  
  const updates = {};
  
  if (warranty_days !== undefined) {
    setSetting('warranty_days', warranty_days.toString(), req.user.id);
    updates.warranty_days = warranty_days;
  }
  if (invoice_prefix !== undefined) {
    setSetting('invoice_prefix', invoice_prefix, req.user.id);
    updates.invoice_prefix = invoice_prefix;
  }
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'settings', null, null, updates, req);
  
  res.json({
    success: true,
    message: 'Service settings updated successfully',
    data: updates
  });
}));

router.get('/activity-log', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, user_id, action, table_name, date_from, date_to } = req.query;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (user_id) {
    whereClause += ' AND al.user_id = ?';
    params.push(user_id);
  }
  if (action) {
    whereClause += ' AND al.action = ?';
    params.push(action);
  }
  if (table_name) {
    whereClause += ' AND al.table_name = ?';
    params.push(table_name);
  }
  if (date_from) {
    whereClause += ' AND al.created_at >= ?';
    params.push(date_from);
  }
  if (date_to) {
    whereClause += ' AND al.created_at <= ?';
    params.push(date_to);
  }
  
  const totalResult = db.prepare(`SELECT COUNT(*) as total FROM activity_log al WHERE ${whereClause}`).get(...params);
  
  const logs = db.prepare(`
    SELECT 
      al.*,
      u.username,
      u.email as user_email
    FROM activity_log al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE ${whereClause}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), parseInt(offset));
  
  res.json({
    success: true,
    data: logs,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: totalResult.total
    }
  });
}));

module.exports = router;
