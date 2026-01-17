const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase } = require('../database/db');
const { authenticate, isAdminOrTechnician } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { CUSTOMER_SOURCES, BUSINESS_TYPES, DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } = require('../config/constants');

const router = express.Router();

const customerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must be less than 500 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('gst_number')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Please provide a valid GST number'),
  body('business_type')
    .optional()
    .isIn(Object.values(BUSINESS_TYPES))
    .withMessage('Invalid business type'),
  body('source')
    .optional()
    .isIn(Object.values(CUSTOMER_SOURCES))
    .withMessage('Invalid source')
];

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: MAX_PAGINATION_LIMIT }).toInt(),
  query('search').optional().trim(),
  query('source').optional().isIn(Object.values(CUSTOMER_SOURCES)),
  query('business_type').optional().isIn(Object.values(BUSINESS_TYPES))
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    page = 1, 
    limit = DEFAULT_PAGINATION_LIMIT, 
    search, 
    source, 
    business_type,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = req.query;
  
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (search) {
    whereClause += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (source) {
    whereClause += ' AND source = ?';
    params.push(source);
  }
  
  if (business_type) {
    whereClause += ' AND business_type = ?';
    params.push(business_type);
  }
  
  const allowedSortFields = ['name', 'phone', 'created_at', 'total_spent', 'repair_count'];
  const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const countQuery = `SELECT COUNT(*) as total FROM customers WHERE ${whereClause}`;
  const totalResult = db.prepare(countQuery).get(...params);
  
  const dataQuery = `
    SELECT * FROM customers 
    WHERE ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;
  
  const customers = db.prepare(dataQuery).all(...params, limit, offset);
  
  res.json({
    success: true,
    data: customers,
    pagination: {
      page,
      limit,
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.post('/', authenticate, isAdminOrTechnician, customerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { name, phone, email, address, city, gst_number, business_type, source, notes } = req.body;
  const db = getDatabase();
  
  const existingCustomer = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
  if (existingCustomer) {
    throw new ConflictError('Customer with this phone number already exists');
  }
  
  const stmt = db.prepare(`
    INSERT INTO customers (name, phone, email, address, city, gst_number, business_type, source, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    name, 
    phone, 
    email || null, 
    address || null, 
    city || 'Barrackpore', 
    gst_number || null, 
    business_type || null, 
    source || null,
    notes || null
  );
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'customers', customer.id, null, customer, req);
  
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: customer
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  res.json({
    success: true,
    data: customer
  });
}));

router.put('/:id', authenticate, isAdminOrTechnician, customerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { id } = req.params;
  const { name, phone, email, address, city, gst_number, business_type, source, notes } = req.body;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const existingCustomer = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone, id);
  if (existingCustomer) {
    throw new ConflictError('Another customer with this phone number already exists');
  }
  
  const stmt = db.prepare(`
    UPDATE customers SET
      name = ?,
      phone = ?,
      email = ?,
      address = ?,
      city = ?,
      gst_number = ?,
      business_type = ?,
      source = ?,
      notes = ?,
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    name,
    phone,
    email || null,
    address || null,
    city || 'Barrackpore',
    gst_number || null,
    business_type || null,
    source || null,
    notes || null,
    id
  );
  
  const updatedCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'customers', id, customer, updatedCustomer, req);
  
  res.json({
    success: true,
    message: 'Customer updated successfully',
    data: updatedCustomer
  });
}));

router.delete('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const repairs = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE customer_id = ?').get(id);
  if (repairs.count > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete customer with existing repairs',
      message: `This customer has ${repairs.count} repair(s) associated. Please delete or reassign them first.`
    });
  }
  
  db.prepare('DELETE FROM customers WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'customers', id, customer, null, req);
  
  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
}));

router.get('/:id/repairs', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = DEFAULT_PAGINATION_LIMIT } = req.query;
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const totalResult = db.prepare('SELECT COUNT(*) as total FROM repairs WHERE customer_id = ?').get(id);
  
  const repairs = db.prepare(`
    SELECT r.*, s.name as service_name, s.category as service_category
    FROM repairs r
    LEFT JOIN services s ON r.service_id = s.id
    WHERE r.customer_id = ?
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(id, limit, offset);
  
  res.json({
    success: true,
    data: repairs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.get('/:id/invoices', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = DEFAULT_PAGINATION_LIMIT } = req.query;
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const totalResult = db.prepare('SELECT COUNT(*) as total FROM invoices WHERE customer_id = ?').get(id);
  
  const invoices = db.prepare(`
    SELECT * FROM invoices
    WHERE customer_id = ?
    ORDER BY invoice_date DESC
    LIMIT ? OFFSET ?
  `).all(id, limit, offset);
  
  res.json({
    success: true,
    data: invoices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.get('/:id/digital-services', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const services = db.prepare(`
    SELECT * FROM digital_services
    WHERE customer_id = ?
    ORDER BY created_at DESC
  `).all(id);
  
  res.json({
    success: true,
    data: services,
    total: services.length
  });
}));

router.get('/:id/stats', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const repairStats = db.prepare(`
    SELECT 
      COUNT(*) as total_repairs,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_repairs,
      SUM(final_price) as total_repair_value,
      AVG(final_price) as avg_repair_value
    FROM repairs WHERE customer_id = ?
  `).get(id);
  
  const invoiceStats = db.prepare(`
    SELECT 
      COUNT(*) as total_invoices,
      SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
      SUM(total_amount) as total_invoiced,
      SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN payment_status IN ('unpaid', 'partial', 'overdue') THEN total_amount ELSE 0 END) as total_pending
    FROM invoices WHERE customer_id = ?
  `).get(id);
  
  const digitalStats = db.prepare(`
    SELECT 
      COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
      SUM(total_amount) as total_digital_value
    FROM digital_services WHERE customer_id = ?
  `).get(id);
  
  const firstRepair = db.prepare(`
    SELECT created_at FROM repairs WHERE customer_id = ? ORDER BY created_at ASC LIMIT 1
  `).get(id);
  
  res.json({
    success: true,
    data: {
      customer,
      repairs: repairStats,
      invoices: invoiceStats,
      digital_services: digitalStats,
      lifetime_value: (repairStats.total_repair_value || 0) + (digitalStats.total_digital_value || 0),
      customer_since: firstRepair?.created_at || customer.created_at,
      is_repeat_customer: repairStats.total_repairs > 1
    }
  });
}));

module.exports = router;
