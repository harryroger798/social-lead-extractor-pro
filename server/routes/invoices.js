const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase, getNextInvoiceNumber, getSetting } = require('../database/db');
const { authenticate, isAdminOrTechnician } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { 
  PAYMENT_STATUS, 
  PAYMENT_METHODS, 
  DEFAULT_PAGINATION_LIMIT, 
  MAX_PAGINATION_LIMIT,
  DEFAULT_GST_RATE
} = require('../config/constants');

const router = express.Router();

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: MAX_PAGINATION_LIMIT }).toInt(),
  query('status').optional().isIn(Object.values(PAYMENT_STATUS))
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    page = 1, 
    limit = DEFAULT_PAGINATION_LIMIT, 
    status,
    customer_id,
    date_from,
    date_to,
    search,
    sort_by = 'invoice_date',
    sort_order = 'DESC'
  } = req.query;
  
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND i.payment_status = ?';
    params.push(status);
  }
  
  if (customer_id) {
    whereClause += ' AND i.customer_id = ?';
    params.push(customer_id);
  }
  
  if (date_from) {
    whereClause += ' AND i.invoice_date >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    whereClause += ' AND i.invoice_date <= ?';
    params.push(date_to);
  }
  
  if (search) {
    whereClause += ' AND (i.invoice_number LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  const allowedSortFields = ['invoice_date', 'invoice_number', 'total_amount', 'payment_status', 'due_date'];
  const sortField = allowedSortFields.includes(sort_by) ? `i.${sort_by}` : 'i.invoice_date';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE ${whereClause}
  `;
  const totalResult = db.prepare(countQuery).get(...params);
  
  const dataQuery = `
    SELECT 
      i.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      r.invoice_number as repair_invoice_number,
      r.device_type,
      r.brand,
      r.model
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN repairs r ON i.repair_id = r.id
    WHERE ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;
  
  const invoices = db.prepare(dataQuery).all(...params, limit, offset);
  
  res.json({
    success: true,
    data: invoices,
    pagination: {
      page,
      limit,
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const invoice = db.prepare(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      c.address as customer_address,
      c.city as customer_city,
      c.gst_number as customer_gst_number,
      r.invoice_number as repair_invoice_number,
      r.device_type,
      r.brand,
      r.model,
      r.issue_description,
      r.diagnosis,
      r.parts_cost,
      r.labor_cost,
      r.warranty_days,
      r.warranty_expiry,
      s.name as service_name
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    LEFT JOIN repairs r ON i.repair_id = r.id
    LEFT JOIN services s ON r.service_id = s.id
    WHERE i.id = ?
  `).get(id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const payments = db.prepare(`
    SELECT p.*, u.username as created_by_name
    FROM payments p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.invoice_id = ?
    ORDER BY p.payment_date DESC
  `).all(id);
  
  const businessSettings = {
    business_name: getSetting('business_name'),
    owner_name: getSetting('owner_name'),
    business_phone: getSetting('business_phone'),
    business_email: getSetting('business_email'),
    business_address: getSetting('business_address'),
    business_city: getSetting('business_city'),
    gst_number: getSetting('gst_number'),
    gst_registered: getSetting('gst_registered') === '1',
    bank_account: getSetting('bank_account'),
    bank_name: getSetting('bank_name'),
    bank_ifsc: getSetting('bank_ifsc'),
    upi_id: getSetting('upi_id')
  };
  
  res.json({
    success: true,
    data: {
      ...invoice,
      payments,
      business: businessSettings
    }
  });
}));

router.post('/:id/generate', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { gst_registered, gst_number } = req.body;
  const db = getDatabase();
  
  const repair = db.prepare(`
    SELECT r.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE r.id = ?
  `).get(id);
  
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const existingInvoice = db.prepare('SELECT * FROM invoices WHERE repair_id = ?').get(id);
  if (existingInvoice) {
    return res.json({
      success: true,
      message: 'Invoice already exists',
      data: existingInvoice
    });
  }
  
  const invoiceNumber = getNextInvoiceNumber();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  
  const businessGstRegistered = gst_registered !== undefined ? gst_registered : getSetting('gst_registered') === '1';
  const businessGstNumber = gst_number || getSetting('gst_number');
  
  const stmt = db.prepare(`
    INSERT INTO invoices (
      invoice_number, customer_id, repair_id, invoice_type,
      subtotal, gst_rate, gst_amount, total_amount,
      gst_registered, gst_number, payment_status, due_date
    ) VALUES (?, ?, ?, 'repair', ?, ?, ?, ?, ?, ?, 'unpaid', ?)
  `);
  
  const result = stmt.run(
    invoiceNumber,
    repair.customer_id,
    id,
    repair.total_cost,
    DEFAULT_GST_RATE,
    repair.gst_amount,
    repair.final_price,
    businessGstRegistered ? 1 : 0,
    businessGstNumber || null,
    dueDate.toISOString()
  );
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'invoices', invoice.id, null, invoice, req);
  
  res.status(201).json({
    success: true,
    message: 'Invoice generated successfully',
    data: invoice
  });
}));

router.post('/:id/mark-paid', authenticate, isAdminOrTechnician, [
  body('payment_method')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage('Invalid payment method'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('reference_number')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Reference number must be less than 100 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { id } = req.params;
  const { payment_method, amount, reference_number, notes, payment_date } = req.body;
  const db = getDatabase();
  
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const paymentAmount = amount !== undefined ? parseFloat(amount) : invoice.total_amount;
  const actualPaymentDate = payment_date || new Date().toISOString();
  
  const paymentStmt = db.prepare(`
    INSERT INTO payments (invoice_id, amount, payment_method, payment_date, reference_number, notes, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  paymentStmt.run(id, paymentAmount, payment_method, actualPaymentDate, reference_number || null, notes || null, req.user.id);
  
  const totalPaid = db.prepare('SELECT SUM(amount) as total FROM payments WHERE invoice_id = ?').get(id);
  const paidAmount = totalPaid.total || 0;
  
  let newStatus = PAYMENT_STATUS.UNPAID;
  if (paidAmount >= invoice.total_amount) {
    newStatus = PAYMENT_STATUS.PAID;
  } else if (paidAmount > 0) {
    newStatus = PAYMENT_STATUS.PARTIAL;
  }
  
  db.prepare(`
    UPDATE invoices SET
      payment_status = ?,
      payment_method = ?,
      payment_date = ?,
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newStatus, payment_method, actualPaymentDate, id);
  
  const updatedInvoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'invoices', id, { payment_status: invoice.payment_status }, { payment_status: newStatus, payment_amount: paymentAmount }, req);
  
  res.json({
    success: true,
    message: `Payment of ₹${paymentAmount} recorded successfully`,
    data: updatedInvoice,
    total_paid: paidAmount,
    remaining: Math.max(0, invoice.total_amount - paidAmount)
  });
}));

router.get('/:id/payments', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const invoice = db.prepare('SELECT id, total_amount FROM invoices WHERE id = ?').get(id);
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const payments = db.prepare(`
    SELECT p.*, u.username as created_by_name
    FROM payments p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.invoice_id = ?
    ORDER BY p.payment_date DESC
  `).all(id);
  
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  res.json({
    success: true,
    data: payments,
    summary: {
      total_amount: invoice.total_amount,
      total_paid: totalPaid,
      remaining: Math.max(0, invoice.total_amount - totalPaid)
    }
  });
}));

router.get('/:id/payment-qr', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const upiId = getSetting('upi_id') || '7003888936@ptyes';
  const businessName = getSetting('business_name') || 'ByteCare';
  
  const totalPaid = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = ?').get(id);
  const remainingAmount = Math.max(0, invoice.total_amount - (totalPaid.total || 0));
  
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${remainingAmount}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoice_number}`)}`;
  
  res.json({
    success: true,
    data: {
      upi_url: upiUrl,
      upi_id: upiId,
      amount: remainingAmount,
      invoice_number: invoice.invoice_number,
      customer_name: invoice.customer_name
    }
  });
}));

router.post('/:id/send-email', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, message } = req.body;
  const db = getDatabase();
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const recipientEmail = email || invoice.customer_email;
  if (!recipientEmail) {
    return res.status(400).json({
      success: false,
      error: 'No email address provided',
      message: 'Please provide an email address or update customer email'
    });
  }
  
  db.prepare(`
    INSERT INTO omnisend_log (invoice_id, customer_id, message_type, recipient, subject, body, status)
    VALUES (?, ?, 'email', ?, ?, ?, 'pending')
  `).run(id, invoice.customer_id, recipientEmail, `Invoice ${invoice.invoice_number} from ${getSetting('business_name')}`, message || 'Please find your invoice attached.');
  
  db.prepare(`
    UPDATE invoices SET email_sent = 1, email_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
  
  res.json({
    success: true,
    message: 'Email queued for sending',
    data: {
      recipient: recipientEmail,
      invoice_number: invoice.invoice_number
    }
  });
}));

router.post('/:id/send-sms', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { phone, message } = req.body;
  const db = getDatabase();
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(id);
  
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  const recipientPhone = phone || invoice.customer_phone;
  if (!recipientPhone) {
    return res.status(400).json({
      success: false,
      error: 'No phone number provided',
      message: 'Please provide a phone number or update customer phone'
    });
  }
  
  const defaultMessage = `Dear ${invoice.customer_name}, your invoice ${invoice.invoice_number} for ₹${invoice.total_amount} is ready. Thank you for choosing ${getSetting('business_name')}!`;
  
  db.prepare(`
    INSERT INTO omnisend_log (invoice_id, customer_id, message_type, recipient, body, status)
    VALUES (?, ?, 'sms', ?, ?, 'pending')
  `).run(id, invoice.customer_id, recipientPhone, message || defaultMessage);
  
  db.prepare(`
    UPDATE invoices SET sms_sent = 1, sms_sent_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);
  
  res.json({
    success: true,
    message: 'SMS queued for sending',
    data: {
      recipient: recipientPhone,
      invoice_number: invoice.invoice_number
    }
  });
}));

router.put('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { discount_amount, discount_percent, notes, terms, due_date } = req.body;
  const db = getDatabase();
  
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  let newSubtotal = invoice.subtotal;
  let newDiscount = invoice.discount_amount;
  
  if (discount_percent !== undefined) {
    newDiscount = (invoice.subtotal * discount_percent) / 100;
  } else if (discount_amount !== undefined) {
    newDiscount = discount_amount;
  }
  
  const discountedSubtotal = newSubtotal - newDiscount;
  const newGstAmount = discountedSubtotal * (invoice.gst_rate / 100);
  const newTotal = discountedSubtotal + newGstAmount;
  
  db.prepare(`
    UPDATE invoices SET
      discount_amount = ?,
      discount_percent = ?,
      gst_amount = ?,
      total_amount = ?,
      notes = COALESCE(?, notes),
      terms = COALESCE(?, terms),
      due_date = COALESCE(?, due_date),
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newDiscount, discount_percent || 0, newGstAmount, newTotal, notes, terms, due_date, id);
  
  const updatedInvoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'invoices', id, invoice, updatedInvoice, req);
  
  res.json({
    success: true,
    message: 'Invoice updated successfully',
    data: updatedInvoice
  });
}));

// Manual invoice creation (without repair)
router.post('/', authenticate, isAdminOrTechnician, [
  body('customer_id').isInt().withMessage('Customer ID is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.amount').isFloat({ min: 0 }).withMessage('Item amount must be a positive number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { customer_id, items, discount_amount = 0, notes, due_days = 7 } = req.body;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const discountedSubtotal = subtotal - discount_amount;
  const gstAmount = discountedSubtotal * (DEFAULT_GST_RATE / 100);
  const totalAmount = discountedSubtotal + gstAmount;
  
  const invoiceNumber = getNextInvoiceNumber();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + due_days);
  
  const stmt = db.prepare(`
    INSERT INTO invoices (
      invoice_number, customer_id, invoice_type,
      subtotal, discount_amount, gst_rate, gst_amount, total_amount,
      payment_status, due_date, notes
    ) VALUES (?, ?, 'manual', ?, ?, ?, ?, ?, 'unpaid', ?, ?)
  `);
  
  const result = stmt.run(
    invoiceNumber,
    customer_id,
    subtotal,
    discount_amount,
    DEFAULT_GST_RATE,
    gstAmount,
    totalAmount,
    dueDate.toISOString(),
    notes || null
  );
  
  // Store line items in notes field as JSON for now
  const itemsJson = JSON.stringify(items);
  db.prepare('UPDATE invoices SET notes = ? WHERE id = ?').run(itemsJson, result.lastInsertRowid);
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `).get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'invoices', invoice.id, null, invoice, req);
  
  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: invoice
  });
}));

router.delete('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) {
    throw new NotFoundError('Invoice');
  }
  
  if (invoice.payment_status === PAYMENT_STATUS.PAID) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete paid invoice',
      message: 'Paid invoices cannot be deleted. Please refund first if needed.'
    });
  }
  
  db.prepare('DELETE FROM payments WHERE invoice_id = ?').run(id);
  db.prepare('DELETE FROM omnisend_log WHERE invoice_id = ?').run(id);
  db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'invoices', id, invoice, null, req);
  
  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
}));

router.get('/overdue/list', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const overdueInvoices = db.prepare(`
    SELECT 
      i.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      julianday('now') - julianday(i.due_date) as days_overdue
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.payment_status IN ('unpaid', 'partial')
      AND i.due_date < datetime('now')
    ORDER BY i.due_date ASC
  `).all();
  
  db.prepare(`
    UPDATE invoices SET payment_status = 'overdue'
    WHERE payment_status IN ('unpaid', 'partial')
      AND due_date < datetime('now')
  `).run();
  
  res.json({
    success: true,
    data: overdueInvoices,
    total: overdueInvoices.length
  });
}));

module.exports = router;
