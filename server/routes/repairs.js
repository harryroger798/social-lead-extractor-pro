const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase, getNextInvoiceNumber } = require('../database/db');
const { authenticate, isAdminOrTechnician } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { 
  REPAIR_STATUS, 
  DEVICE_TYPES, 
  PRIORITY,
  DEFAULT_PAGINATION_LIMIT, 
  MAX_PAGINATION_LIMIT,
  DEFAULT_WARRANTY_DAYS,
  DEFAULT_GST_RATE
} = require('../config/constants');

const router = express.Router();

const repairValidation = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('device_type')
    .isIn(Object.values(DEVICE_TYPES))
    .withMessage('Invalid device type'),
  body('issue_description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Issue description must be between 10 and 2000 characters'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand must be less than 100 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters'),
  body('parts_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Parts cost must be a positive number'),
  body('labor_cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Labor cost must be a positive number'),
  body('priority')
    .optional()
    .isIn(Object.values(PRIORITY))
    .withMessage('Invalid priority')
];

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: MAX_PAGINATION_LIMIT }).toInt(),
  query('status').optional().isIn(Object.values(REPAIR_STATUS)),
  query('device_type').optional().isIn(Object.values(DEVICE_TYPES)),
  query('customer_id').optional().isInt({ min: 1 }).toInt()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    page = 1, 
    limit = DEFAULT_PAGINATION_LIMIT, 
    status,
    device_type,
    customer_id,
    date_from,
    date_to,
    search,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = req.query;
  
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND r.status = ?';
    params.push(status);
  }
  
  if (device_type) {
    whereClause += ' AND r.device_type = ?';
    params.push(device_type);
  }
  
  if (customer_id) {
    whereClause += ' AND r.customer_id = ?';
    params.push(customer_id);
  }
  
  if (date_from) {
    whereClause += ' AND r.created_at >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    whereClause += ' AND r.created_at <= ?';
    params.push(date_to);
  }
  
  if (search) {
    whereClause += ' AND (r.invoice_number LIKE ? OR r.brand LIKE ? OR r.model LIKE ? OR c.name LIKE ? OR c.phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  const allowedSortFields = ['created_at', 'invoice_number', 'status', 'final_price', 'estimated_completion'];
  const sortField = allowedSortFields.includes(sort_by) ? `r.${sort_by}` : 'r.created_at';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE ${whereClause}
  `;
  const totalResult = db.prepare(countQuery).get(...params);
  
  const dataQuery = `
    SELECT 
      r.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      s.name as service_name,
      s.category as service_category,
      u.username as assigned_to_name
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN users u ON r.assigned_to = u.id
    WHERE ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;
  
  const repairs = db.prepare(dataQuery).all(...params, limit, offset);
  
  res.json({
    success: true,
    data: repairs,
    pagination: {
      page,
      limit,
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.post('/', authenticate, isAdminOrTechnician, repairValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    customer_id, 
    service_id,
    device_type, 
    brand, 
    model,
    serial_number,
    issue_description,
    diagnosis,
    parts_cost = 0,
    labor_cost = 0,
    priority = PRIORITY.NORMAL,
    turnaround_hours,
    warranty_days = DEFAULT_WARRANTY_DAYS,
    notes,
    assigned_to
  } = req.body;
  
  const db = getDatabase();
  
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  if (service_id) {
    const service = db.prepare('SELECT id FROM services WHERE id = ?').get(service_id);
    if (!service) {
      throw new NotFoundError('Service');
    }
  }
  
  const invoiceNumber = getNextInvoiceNumber();
  const totalCost = parseFloat(parts_cost) + parseFloat(labor_cost);
  const gstAmount = totalCost * (DEFAULT_GST_RATE / 100);
  const finalPrice = totalCost + gstAmount;
  
  let estimatedCompletion = null;
  if (turnaround_hours) {
    const now = new Date();
    estimatedCompletion = new Date(now.getTime() + turnaround_hours * 60 * 60 * 1000).toISOString();
  }
  
  const stmt = db.prepare(`
    INSERT INTO repairs (
      invoice_number, customer_id, service_id, device_type, brand, model, serial_number,
      issue_description, diagnosis, parts_cost, labor_cost, total_cost, gst_amount, final_price,
      status, priority, turnaround_hours, estimated_completion, warranty_days, notes, assigned_to
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    invoiceNumber,
    customer_id,
    service_id || null,
    device_type,
    brand || null,
    model || null,
    serial_number || null,
    issue_description,
    diagnosis || null,
    parts_cost,
    labor_cost,
    totalCost,
    gstAmount,
    finalPrice,
    REPAIR_STATUS.PENDING,
    priority,
    turnaround_hours || null,
    estimatedCompletion,
    warranty_days,
    notes || null,
    assigned_to || null
  );
  
  db.prepare('UPDATE customers SET repair_count = repair_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(customer_id);
  
  const repair = db.prepare(`
    SELECT r.*, c.name as customer_name, c.phone as customer_phone
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'repairs', repair.id, null, repair, req);
  
  res.status(201).json({
    success: true,
    message: 'Repair ticket created successfully',
    data: repair,
    invoice_number: invoiceNumber
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const repair = db.prepare(`
    SELECT 
      r.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      c.address as customer_address,
      s.name as service_name,
      s.category as service_category,
      u.username as assigned_to_name
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN users u ON r.assigned_to = u.id
    WHERE r.id = ?
  `).get(id);
  
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const mobileRepair = db.prepare('SELECT * FROM mobile_repairs WHERE repair_id = ?').get(id);
  
  res.json({
    success: true,
    data: {
      ...repair,
      mobile_repair: mobileRepair || null
    }
  });
}));

router.put('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const repair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(id);
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const {
    service_id,
    device_type,
    brand,
    model,
    serial_number,
    issue_description,
    diagnosis,
    parts_cost,
    labor_cost,
    priority,
    turnaround_hours,
    warranty_days,
    notes,
    assigned_to,
    before_photos,
    after_photos
  } = req.body;
  
  const newPartsCost = parts_cost !== undefined ? parseFloat(parts_cost) : repair.parts_cost;
  const newLaborCost = labor_cost !== undefined ? parseFloat(labor_cost) : repair.labor_cost;
  const totalCost = newPartsCost + newLaborCost;
  const gstAmount = totalCost * (DEFAULT_GST_RATE / 100);
  const finalPrice = totalCost + gstAmount;
  
  let estimatedCompletion = repair.estimated_completion;
  if (turnaround_hours !== undefined) {
    const now = new Date();
    estimatedCompletion = turnaround_hours ? new Date(now.getTime() + turnaround_hours * 60 * 60 * 1000).toISOString() : null;
  }
  
  const stmt = db.prepare(`
    UPDATE repairs SET
      service_id = COALESCE(?, service_id),
      device_type = COALESCE(?, device_type),
      brand = COALESCE(?, brand),
      model = COALESCE(?, model),
      serial_number = COALESCE(?, serial_number),
      issue_description = COALESCE(?, issue_description),
      diagnosis = COALESCE(?, diagnosis),
      parts_cost = ?,
      labor_cost = ?,
      total_cost = ?,
      gst_amount = ?,
      final_price = ?,
      priority = COALESCE(?, priority),
      turnaround_hours = COALESCE(?, turnaround_hours),
      estimated_completion = ?,
      warranty_days = COALESCE(?, warranty_days),
      notes = COALESCE(?, notes),
      assigned_to = COALESCE(?, assigned_to),
      before_photos = COALESCE(?, before_photos),
      after_photos = COALESCE(?, after_photos),
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    service_id,
    device_type,
    brand,
    model,
    serial_number,
    issue_description,
    diagnosis,
    newPartsCost,
    newLaborCost,
    totalCost,
    gstAmount,
    finalPrice,
    priority,
    turnaround_hours,
    estimatedCompletion,
    warranty_days,
    notes,
    assigned_to,
    before_photos,
    after_photos,
    id
  );
  
  const updatedRepair = db.prepare(`
    SELECT r.*, c.name as customer_name, c.phone as customer_phone
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE r.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'repairs', id, repair, updatedRepair, req);
  
  res.json({
    success: true,
    message: 'Repair updated successfully',
    data: updatedRepair
  });
}));

router.patch('/:id/status', authenticate, isAdminOrTechnician, [
  body('status')
    .isIn(Object.values(REPAIR_STATUS))
    .withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { id } = req.params;
  const { status } = req.body;
  const db = getDatabase();
  
  const repair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(id);
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const updates = { status, updated_at: 'CURRENT_TIMESTAMP', synced_to_airtable: 0 };
  
  if (status === REPAIR_STATUS.IN_PROGRESS && !repair.started_at) {
    updates.started_at = new Date().toISOString();
  }
  
  if (status === REPAIR_STATUS.COMPLETED) {
    updates.completed_at = new Date().toISOString();
    const warrantyExpiry = new Date();
    warrantyExpiry.setDate(warrantyExpiry.getDate() + (repair.warranty_days || DEFAULT_WARRANTY_DAYS));
    updates.warranty_expiry = warrantyExpiry.toISOString();
    
    db.prepare(`
      UPDATE customers SET 
        total_spent = total_spent + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(repair.final_price, repair.customer_id);
  }
  
  let setClause = Object.keys(updates).map(key => {
    if (key === 'updated_at') return `${key} = CURRENT_TIMESTAMP`;
    return `${key} = ?`;
  }).join(', ');
  
  const params = Object.entries(updates)
    .filter(([key]) => key !== 'updated_at')
    .map(([, value]) => value);
  params.push(id);
  
  db.prepare(`UPDATE repairs SET ${setClause} WHERE id = ?`).run(...params);
  
  const updatedRepair = db.prepare(`
    SELECT r.*, c.name as customer_name, c.phone as customer_phone
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE r.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'repairs', id, { status: repair.status }, { status }, req);
  
  res.json({
    success: true,
    message: `Repair status updated to ${status}`,
    data: updatedRepair
  });
}));

router.delete('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const repair = db.prepare('SELECT * FROM repairs WHERE id = ?').get(id);
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const invoice = db.prepare('SELECT id FROM invoices WHERE repair_id = ?').get(id);
  if (invoice) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete repair with existing invoice',
      message: 'Please delete the associated invoice first'
    });
  }
  
  db.prepare('DELETE FROM mobile_repairs WHERE repair_id = ?').run(id);
  db.prepare('DELETE FROM repairs WHERE id = ?').run(id);
  
  db.prepare('UPDATE customers SET repair_count = repair_count - 1 WHERE id = ? AND repair_count > 0')
    .run(repair.customer_id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'repairs', id, repair, null, req);
  
  res.json({
    success: true,
    message: 'Repair deleted successfully'
  });
}));

router.get('/:id/invoice', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const repair = db.prepare('SELECT id FROM repairs WHERE id = ?').get(id);
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  const invoice = db.prepare(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.repair_id = ?
  `).get(id);
  
  if (!invoice) {
    return res.status(404).json({
      success: false,
      error: 'Invoice not found',
      message: 'No invoice has been generated for this repair yet'
    });
  }
  
  res.json({
    success: true,
    data: invoice
  });
}));

router.post('/:id/complete', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { photos, generate_invoice = true } = req.body;
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
  
  const completedAt = new Date().toISOString();
  const warrantyExpiry = new Date();
  warrantyExpiry.setDate(warrantyExpiry.getDate() + (repair.warranty_days || DEFAULT_WARRANTY_DAYS));
  
  db.prepare(`
    UPDATE repairs SET
      status = ?,
      completed_at = ?,
      warranty_expiry = ?,
      after_photos = COALESCE(?, after_photos),
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(REPAIR_STATUS.COMPLETED, completedAt, warrantyExpiry.toISOString(), photos ? JSON.stringify(photos) : null, id);
  
  db.prepare(`
    UPDATE customers SET 
      total_spent = total_spent + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(repair.final_price, repair.customer_id);
  
  let invoice = null;
  if (generate_invoice) {
    const existingInvoice = db.prepare('SELECT id FROM invoices WHERE repair_id = ?').get(id);
    
    if (!existingInvoice) {
      const invoiceNumber = getNextInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, customer_id, repair_id, invoice_type,
          subtotal, gst_rate, gst_amount, total_amount,
          payment_status, due_date
        ) VALUES (?, ?, ?, 'repair', ?, ?, ?, ?, 'unpaid', ?)
      `);
      
      const invoiceResult = invoiceStmt.run(
        invoiceNumber,
        repair.customer_id,
        id,
        repair.total_cost,
        DEFAULT_GST_RATE,
        repair.gst_amount,
        repair.final_price,
        dueDate.toISOString()
      );
      
      invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceResult.lastInsertRowid);
    }
  }
  
  const updatedRepair = db.prepare(`
    SELECT r.*, c.name as customer_name, c.phone as customer_phone
    FROM repairs r
    LEFT JOIN customers c ON r.customer_id = c.id
    WHERE r.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'repairs', id, { status: repair.status }, { status: REPAIR_STATUS.COMPLETED }, req);
  
  res.json({
    success: true,
    message: 'Repair completed successfully',
    data: updatedRepair,
    invoice_generated: !!invoice,
    invoice: invoice
  });
}));

router.post('/:id/mobile-details', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { phone_model, imei_number, repair_type, parts_replaced, parts_supplier, parts_cost, software_issues, hardware_issues } = req.body;
  const db = getDatabase();
  
  const repair = db.prepare('SELECT id, device_type FROM repairs WHERE id = ?').get(id);
  if (!repair) {
    throw new NotFoundError('Repair');
  }
  
  if (repair.device_type !== DEVICE_TYPES.MOBILE) {
    return res.status(400).json({
      success: false,
      error: 'Invalid device type',
      message: 'Mobile details can only be added to mobile repairs'
    });
  }
  
  const existingMobileRepair = db.prepare('SELECT id FROM mobile_repairs WHERE repair_id = ?').get(id);
  
  if (existingMobileRepair) {
    db.prepare(`
      UPDATE mobile_repairs SET
        phone_model = COALESCE(?, phone_model),
        imei_number = COALESCE(?, imei_number),
        repair_type = COALESCE(?, repair_type),
        parts_replaced = COALESCE(?, parts_replaced),
        parts_supplier = COALESCE(?, parts_supplier),
        parts_cost = COALESCE(?, parts_cost),
        software_issues = COALESCE(?, software_issues),
        hardware_issues = COALESCE(?, hardware_issues),
        updated_at = CURRENT_TIMESTAMP
      WHERE repair_id = ?
    `).run(phone_model, imei_number, repair_type, parts_replaced, parts_supplier, parts_cost, software_issues, hardware_issues, id);
  } else {
    db.prepare(`
      INSERT INTO mobile_repairs (repair_id, phone_model, imei_number, repair_type, parts_replaced, parts_supplier, parts_cost, software_issues, hardware_issues)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, phone_model, imei_number, repair_type, parts_replaced, parts_supplier, parts_cost, software_issues, hardware_issues);
  }
  
  const mobileRepair = db.prepare('SELECT * FROM mobile_repairs WHERE repair_id = ?').get(id);
  
  res.json({
    success: true,
    message: 'Mobile repair details saved successfully',
    data: mobileRepair
  });
}));

router.get('/status/summary', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const summary = db.prepare(`
    SELECT 
      status,
      COUNT(*) as count
    FROM repairs
    GROUP BY status
  `).all();
  
  const statusCounts = {};
  Object.values(REPAIR_STATUS).forEach(status => {
    statusCounts[status] = 0;
  });
  
  summary.forEach(item => {
    statusCounts[item.status] = item.count;
  });
  
  res.json({
    success: true,
    data: statusCounts
  });
}));

module.exports = router;
