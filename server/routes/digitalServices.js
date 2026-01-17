const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase, getNextProjectId } = require('../database/db');
const { authenticate, isAdminOrTechnician } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { 
  DIGITAL_SERVICE_TYPES, 
  DIGITAL_SERVICE_STATUS,
  RETAINER_FREQUENCY,
  DEFAULT_PAGINATION_LIMIT, 
  MAX_PAGINATION_LIMIT,
  DEFAULT_GST_RATE
} = require('../config/constants');

const router = express.Router();

const digitalServiceValidation = [
  body('customer_id')
    .isInt({ min: 1 })
    .withMessage('Valid customer ID is required'),
  body('service_type')
    .isIn(Object.values(DIGITAL_SERVICE_TYPES))
    .withMessage('Invalid service type'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('is_retainer')
    .optional()
    .isBoolean()
    .withMessage('is_retainer must be a boolean'),
  body('retainer_frequency')
    .optional()
    .isIn(Object.values(RETAINER_FREQUENCY))
    .withMessage('Invalid retainer frequency')
];

router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: MAX_PAGINATION_LIMIT }).toInt(),
  query('status').optional().isIn(Object.values(DIGITAL_SERVICE_STATUS)),
  query('service_type').optional().isIn(Object.values(DIGITAL_SERVICE_TYPES))
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    page = 1, 
    limit = DEFAULT_PAGINATION_LIMIT, 
    status,
    service_type,
    customer_id,
    is_retainer,
    search,
    sort_by = 'created_at',
    sort_order = 'DESC'
  } = req.query;
  
  const offset = (page - 1) * limit;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND ds.status = ?';
    params.push(status);
  }
  
  if (service_type) {
    whereClause += ' AND ds.service_type = ?';
    params.push(service_type);
  }
  
  if (customer_id) {
    whereClause += ' AND ds.customer_id = ?';
    params.push(customer_id);
  }
  
  if (is_retainer !== undefined) {
    whereClause += ' AND ds.is_retainer = ?';
    params.push(is_retainer === 'true' || is_retainer === '1' ? 1 : 0);
  }
  
  if (search) {
    whereClause += ' AND (ds.project_id LIKE ? OR ds.title LIKE ? OR c.name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  const allowedSortFields = ['created_at', 'project_id', 'status', 'total_amount', 'due_date'];
  const sortField = allowedSortFields.includes(sort_by) ? `ds.${sort_by}` : 'ds.created_at';
  const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ${whereClause}
  `;
  const totalResult = db.prepare(countQuery).get(...params);
  
  const dataQuery = `
    SELECT 
      ds.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;
  
  const services = db.prepare(dataQuery).all(...params, limit, offset);
  
  res.json({
    success: true,
    data: services,
    pagination: {
      page,
      limit,
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / limit)
    }
  });
}));

router.post('/', authenticate, isAdminOrTechnician, digitalServiceValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { 
    customer_id, 
    service_type,
    title,
    description,
    amount,
    is_retainer = false,
    retainer_amount,
    retainer_frequency,
    deliverables,
    milestones,
    due_date,
    notes
  } = req.body;
  
  const db = getDatabase();
  
  const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  const projectId = getNextProjectId();
  const gstAmount = parseFloat(amount) * (DEFAULT_GST_RATE / 100);
  const totalAmount = parseFloat(amount) + gstAmount;
  
  const stmt = db.prepare(`
    INSERT INTO digital_services (
      project_id, customer_id, service_type, title, description,
      amount, gst_amount, total_amount, is_retainer, retainer_amount, retainer_frequency,
      deliverables, milestones, due_date, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'proposal')
  `);
  
  const result = stmt.run(
    projectId,
    customer_id,
    service_type,
    title,
    description || null,
    amount,
    gstAmount,
    totalAmount,
    is_retainer ? 1 : 0,
    retainer_amount || null,
    retainer_frequency || null,
    deliverables ? JSON.stringify(deliverables) : null,
    milestones ? JSON.stringify(milestones) : null,
    due_date || null,
    notes || null
  );
  
  const service = db.prepare(`
    SELECT ds.*, c.name as customer_name, c.phone as customer_phone
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ds.id = ?
  `).get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'digital_services', service.id, null, service, req);
  
  res.status(201).json({
    success: true,
    message: 'Digital service project created successfully',
    data: service,
    project_id: projectId
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const service = db.prepare(`
    SELECT 
      ds.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email,
      c.address as customer_address
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ds.id = ?
  `).get(id);
  
  if (!service) {
    throw new NotFoundError('Digital service');
  }
  
  if (service.deliverables) {
    try {
      service.deliverables = JSON.parse(service.deliverables);
    } catch (e) {
      service.deliverables = [];
    }
  }
  
  if (service.milestones) {
    try {
      service.milestones = JSON.parse(service.milestones);
    } catch (e) {
      service.milestones = [];
    }
  }
  
  res.json({
    success: true,
    data: service
  });
}));

router.put('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM digital_services WHERE id = ?').get(id);
  if (!service) {
    throw new NotFoundError('Digital service');
  }
  
  const {
    service_type,
    title,
    description,
    amount,
    is_retainer,
    retainer_amount,
    retainer_frequency,
    deliverables,
    milestones,
    due_date,
    notes
  } = req.body;
  
  let newAmount = amount !== undefined ? parseFloat(amount) : service.amount;
  let gstAmount = newAmount * (DEFAULT_GST_RATE / 100);
  let totalAmount = newAmount + gstAmount;
  
  const stmt = db.prepare(`
    UPDATE digital_services SET
      service_type = COALESCE(?, service_type),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      amount = ?,
      gst_amount = ?,
      total_amount = ?,
      is_retainer = COALESCE(?, is_retainer),
      retainer_amount = COALESCE(?, retainer_amount),
      retainer_frequency = COALESCE(?, retainer_frequency),
      deliverables = COALESCE(?, deliverables),
      milestones = COALESCE(?, milestones),
      due_date = COALESCE(?, due_date),
      notes = COALESCE(?, notes),
      synced_to_airtable = 0,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    service_type,
    title,
    description,
    newAmount,
    gstAmount,
    totalAmount,
    is_retainer !== undefined ? (is_retainer ? 1 : 0) : null,
    retainer_amount,
    retainer_frequency,
    deliverables ? JSON.stringify(deliverables) : null,
    milestones ? JSON.stringify(milestones) : null,
    due_date,
    notes,
    id
  );
  
  const updatedService = db.prepare(`
    SELECT ds.*, c.name as customer_name, c.phone as customer_phone
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ds.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'digital_services', id, service, updatedService, req);
  
  res.json({
    success: true,
    message: 'Digital service updated successfully',
    data: updatedService
  });
}));

router.patch('/:id/status', authenticate, isAdminOrTechnician, [
  body('status')
    .isIn(Object.values(DIGITAL_SERVICE_STATUS))
    .withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { id } = req.params;
  const { status } = req.body;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM digital_services WHERE id = ?').get(id);
  if (!service) {
    throw new NotFoundError('Digital service');
  }
  
  const updates = { status };
  
  if (status === DIGITAL_SERVICE_STATUS.IN_PROGRESS && !service.started_at) {
    updates.started_at = new Date().toISOString();
  }
  
  if (status === DIGITAL_SERVICE_STATUS.COMPLETED) {
    updates.completed_at = new Date().toISOString();
    
    db.prepare(`
      UPDATE customers SET 
        total_spent = total_spent + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(service.total_amount, service.customer_id);
  }
  
  let setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  setClause += ', synced_to_airtable = 0, updated_at = CURRENT_TIMESTAMP';
  
  const params = Object.values(updates);
  params.push(id);
  
  db.prepare(`UPDATE digital_services SET ${setClause} WHERE id = ?`).run(...params);
  
  const updatedService = db.prepare(`
    SELECT ds.*, c.name as customer_name, c.phone as customer_phone
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ds.id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'digital_services', id, { status: service.status }, { status }, req);
  
  res.json({
    success: true,
    message: `Project status updated to ${status}`,
    data: updatedService
  });
}));

router.delete('/:id', authenticate, isAdminOrTechnician, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM digital_services WHERE id = ?').get(id);
  if (!service) {
    throw new NotFoundError('Digital service');
  }
  
  const invoice = db.prepare('SELECT id FROM invoices WHERE digital_service_id = ?').get(id);
  if (invoice) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete project with existing invoice',
      message: 'Please delete the associated invoice first'
    });
  }
  
  db.prepare('DELETE FROM digital_services WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'digital_services', id, service, null, req);
  
  res.json({
    success: true,
    message: 'Digital service project deleted successfully'
  });
}));

router.get('/retainers/active', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const retainers = db.prepare(`
    SELECT 
      ds.*,
      c.name as customer_name,
      c.phone as customer_phone,
      c.email as customer_email
    FROM digital_services ds
    LEFT JOIN customers c ON ds.customer_id = c.id
    WHERE ds.is_retainer = 1 AND ds.status IN ('signed', 'in_progress')
    ORDER BY ds.created_at DESC
  `).all();
  
  const totalMonthlyRevenue = retainers
    .filter(r => r.retainer_frequency === 'monthly')
    .reduce((sum, r) => sum + (r.retainer_amount || 0), 0);
  
  res.json({
    success: true,
    data: retainers,
    total: retainers.length,
    total_monthly_revenue: totalMonthlyRevenue
  });
}));

router.get('/stats/summary', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total_value
    FROM digital_services
    GROUP BY status
  `).all();
  
  const typeBreakdown = db.prepare(`
    SELECT service_type, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total_value
    FROM digital_services
    GROUP BY service_type
  `).all();
  
  const monthlyRevenue = db.prepare(`
    SELECT 
      strftime('%Y-%m', completed_at) as month,
      COUNT(*) as projects,
      COALESCE(SUM(total_amount), 0) as revenue
    FROM digital_services
    WHERE status = 'completed' AND completed_at >= datetime('now', '-12 months')
    GROUP BY strftime('%Y-%m', completed_at)
    ORDER BY month
  `).all();
  
  res.json({
    success: true,
    data: {
      by_status: statusCounts,
      by_type: typeBreakdown,
      monthly_revenue: monthlyRevenue
    }
  });
}));

module.exports = router;
