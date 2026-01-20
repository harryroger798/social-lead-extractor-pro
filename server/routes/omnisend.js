const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase, getSetting } = require('../database/db');
const { authenticate, isAdminOrTechnician, isAdmin } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { MESSAGE_TYPES, MESSAGE_STATUS } = require('../config/constants');
const mailgunService = require('../services/mailgunService');

const router = express.Router();

router.post('/send-invoice', authenticate, isAdminOrTechnician, [
  body('invoice_id').isInt({ min: 1 }).withMessage('Valid invoice ID is required'),
  body('channel').isIn(Object.values(MESSAGE_TYPES)).withMessage('Invalid channel')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { invoice_id, channel, email, phone, message } = req.body;
  const db = getDatabase();
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(invoice_id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
    const mailgunEnabled = getSetting('mailgun_enabled') === '1';
    const mailgunApiKey = getSetting('mailgun_api_key');
  
    if (!mailgunEnabled || !mailgunApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Mailgun not configured',
        message: 'Please configure Mailgun API key and enable it in settings'
      });
    }
  
  let recipient;
  let subject;
  let body_text;
  
  if (channel === MESSAGE_TYPES.EMAIL) {
    recipient = email || invoice.customer_email;
    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'No email address',
        message: 'Please provide an email address'
      });
    }
    subject = `Invoice ${invoice.invoice_number} from ${getSetting('business_name')}`;
    body_text = message || `Dear ${invoice.customer_name},\n\nPlease find attached your invoice ${invoice.invoice_number} for ₹${invoice.total_amount}.\n\nThank you for your business!\n\n${getSetting('business_name')}`;
  } else if (channel === MESSAGE_TYPES.SMS) {
    recipient = phone || invoice.customer_phone;
    if (!recipient) {
      return res.status(400).json({
        success: false,
        error: 'No phone number',
        message: 'Please provide a phone number'
      });
    }
    body_text = message || `Dear ${invoice.customer_name}, your invoice ${invoice.invoice_number} for ₹${invoice.total_amount} is ready. Thank you! - ${getSetting('business_name')}`;
  } else {
    recipient = phone || invoice.customer_phone;
    body_text = message || `Invoice ${invoice.invoice_number}: ₹${invoice.total_amount}`;
  }
  
  const logStmt = db.prepare(`
    INSERT INTO omnisend_log (invoice_id, customer_id, message_type, recipient, subject, body, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);
  
  const logResult = logStmt.run(invoice_id, invoice.customer_id, channel, recipient, subject || null, body_text);
  
  try {
    const result = await mailgunService.sendMessage({
      channel,
      recipient,
      subject,
      body: body_text,
      invoice
    });
    
    db.prepare(`
      UPDATE omnisend_log SET status = 'sent', omnisend_id = ?, sent_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(result.omnisend_id || null, logResult.lastInsertRowid);
    
    if (channel === MESSAGE_TYPES.EMAIL) {
      db.prepare('UPDATE invoices SET email_sent = 1, email_sent_at = CURRENT_TIMESTAMP WHERE id = ?').run(invoice_id);
    } else if (channel === MESSAGE_TYPES.SMS) {
      db.prepare('UPDATE invoices SET sms_sent = 1, sms_sent_at = CURRENT_TIMESTAMP WHERE id = ?').run(invoice_id);
    }
    
    res.json({
      success: true,
      message: `${channel} sent successfully`,
      data: {
        omnisend_id: result.omnisend_id,
        recipient,
        status: 'sent'
      }
    });
  } catch (error) {
    db.prepare(`
      UPDATE omnisend_log SET status = 'failed', error_message = ?
      WHERE id = ?
    `).run(error.message, logResult.lastInsertRowid);
    
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
}));

router.get('/logs', authenticate, [
  query('invoice_id').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], asyncHandler(async (req, res) => {
  const { invoice_id, customer_id, message_type, status, limit = 50 } = req.query;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (invoice_id) {
    whereClause += ' AND ol.invoice_id = ?';
    params.push(invoice_id);
  }
  
  if (customer_id) {
    whereClause += ' AND ol.customer_id = ?';
    params.push(customer_id);
  }
  
  if (message_type) {
    whereClause += ' AND ol.message_type = ?';
    params.push(message_type);
  }
  
  if (status) {
    whereClause += ' AND ol.status = ?';
    params.push(status);
  }
  
  const logs = db.prepare(`
    SELECT 
      ol.*,
      i.invoice_number,
      c.name as customer_name
    FROM omnisend_log ol
    LEFT JOIN invoices i ON ol.invoice_id = i.id
    LEFT JOIN customers c ON ol.customer_id = c.id
    WHERE ${whereClause}
    ORDER BY ol.created_at DESC
    LIMIT ?
  `).all(...params, limit);
  
  res.json({
    success: true,
    data: logs
  });
}));

router.post('/test-email', authenticate, isAdmin, [
  body('email').isEmail().withMessage('Valid email is required'),
  body('test_message').optional().trim()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { email, test_message } = req.body;
  
    const mailgunEnabled = getSetting('mailgun_enabled') === '1';
    const mailgunApiKey = getSetting('mailgun_api_key');
  
    if (!mailgunEnabled || !mailgunApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Mailgun not configured',
        message: 'Please configure Mailgun API key and enable it in settings'
      });
    }
  
  try {
    const result = await mailgunService.sendTestEmail({
      email,
      message: test_message || `This is a test email from ${getSetting('business_name')}. If you received this, your Mailgun integration is working correctly!`
    });
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error.message
    });
  }
}));

router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const stats = db.prepare(`
    SELECT 
      message_type,
      status,
      COUNT(*) as count
    FROM omnisend_log
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY message_type, status
  `).all();
  
  const monthlyUsage = db.prepare(`
    SELECT 
      strftime('%Y-%m', created_at) as month,
      message_type,
      COUNT(*) as count
    FROM omnisend_log
    WHERE created_at >= datetime('now', '-12 months')
    GROUP BY strftime('%Y-%m', created_at), message_type
    ORDER BY month
  `).all();
  
  const summary = {
    email: { sent: 0, delivered: 0, opened: 0, failed: 0 },
    sms: { sent: 0, delivered: 0, failed: 0 },
    whatsapp: { sent: 0, delivered: 0, failed: 0 }
  };
  
  stats.forEach(stat => {
    if (summary[stat.message_type]) {
      summary[stat.message_type][stat.status] = stat.count;
    }
  });
  
  res.json({
    success: true,
    data: {
      summary,
      monthly_usage: monthlyUsage,
      total_this_month: stats.reduce((sum, s) => sum + s.count, 0)
    }
  });
}));

router.post('/retry/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const log = db.prepare(`
    SELECT ol.*, i.*, c.name as customer_name
    FROM omnisend_log ol
    LEFT JOIN invoices i ON ol.invoice_id = i.id
    LEFT JOIN customers c ON ol.customer_id = c.id
    WHERE ol.id = ?
  `).get(id);
  
  if (!log) {
    throw new NotFoundError('Message log');
  }
  
  if (log.status !== 'failed') {
    return res.status(400).json({
      success: false,
      error: 'Cannot retry',
      message: 'Only failed messages can be retried'
    });
  }
  
  try {
    const result = await mailgunService.sendMessage({
      channel: log.message_type,
      recipient: log.recipient,
      subject: log.subject,
      body: log.body,
      invoice: log
    });
    
    db.prepare(`
      UPDATE omnisend_log SET status = 'sent', omnisend_id = ?, sent_at = CURRENT_TIMESTAMP, error_message = NULL
      WHERE id = ?
    `).run(result.omnisend_id || null, id);
    
    res.json({
      success: true,
      message: 'Message retried successfully',
      data: result
    });
  } catch (error) {
    db.prepare(`
      UPDATE omnisend_log SET error_message = ?
      WHERE id = ?
    `).run(error.message, id);
    
    res.status(500).json({
      success: false,
      error: 'Retry failed',
      message: error.message
    });
  }
}));

module.exports = router;
