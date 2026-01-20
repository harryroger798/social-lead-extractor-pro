const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDatabase } = require('../database/db');
const { authenticate, isAdminOrTechnician, isAdmin } = require('../middleware/auth');
const { asyncHandler, ValidationError, NotFoundError, ConflictError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { SERVICE_CATEGORIES } = require('../config/constants');

const router = express.Router();

const serviceValidation = [
  body('category')
    .isIn(Object.values(SERVICE_CATEGORIES))
    .withMessage('Invalid service category'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('min_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  body('max_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  body('profit_margin')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Profit margin must be between 0 and 100'),
  body('estimated_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer')
];

router.get('/', authenticate, [
  query('category').optional().isIn(Object.values(SERVICE_CATEGORIES)),
  query('is_active').optional().isIn(['0', '1', 'true', 'false'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { category, is_active, search } = req.query;
  const db = getDatabase();
  
  let whereClause = '1=1';
  const params = [];
  
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }
  
  if (is_active !== undefined) {
    const activeValue = is_active === '1' || is_active === 'true' ? 1 : 0;
    whereClause += ' AND is_active = ?';
    params.push(activeValue);
  }
  
  if (search) {
    whereClause += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  const services = db.prepare(`
    SELECT * FROM services
    WHERE ${whereClause}
    ORDER BY category, name
  `).all(...params);
  
  const grouped = {
    PC_REPAIR: [],
    MOBILE_REPAIR: [],
    DIGITAL_SERVICE: []
  };
  
  services.forEach(service => {
    if (grouped[service.category]) {
      grouped[service.category].push(service);
    }
  });
  
  res.json({
    success: true,
    data: services,
    grouped,
    total: services.length
  });
}));

router.post('/', authenticate, isAdmin, serviceValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { category, name, description, price, min_price, max_price, profit_margin, estimated_hours } = req.body;
  const db = getDatabase();
  
  const existingService = db.prepare('SELECT id FROM services WHERE category = ? AND name = ?').get(category, name);
  if (existingService) {
    throw new ConflictError('Service with this name already exists in this category');
  }
  
  const stmt = db.prepare(`
    INSERT INTO services (category, name, description, price, min_price, max_price, profit_margin, estimated_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    category,
    name,
    description || null,
    price,
    min_price || price,
    max_price || price,
    profit_margin || null,
    estimated_hours || null
  );
  
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.CREATE, 'services', service.id, null, service, req);
  
  res.status(201).json({
    success: true,
    message: 'Service created successfully',
    data: service
  });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  
  if (!service) {
    throw new NotFoundError('Service');
  }
  
  const repairCount = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE service_id = ?').get(id);
  
  res.json({
    success: true,
    data: {
      ...service,
      usage_count: repairCount.count
    }
  });
}));

router.put('/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, min_price, max_price, profit_margin, estimated_hours, is_active } = req.body;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) {
    throw new NotFoundError('Service');
  }
  
  if (name && name !== service.name) {
    const existingService = db.prepare('SELECT id FROM services WHERE category = ? AND name = ? AND id != ?')
      .get(service.category, name, id);
    if (existingService) {
      throw new ConflictError('Service with this name already exists in this category');
    }
  }
  
  const stmt = db.prepare(`
    UPDATE services SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      min_price = COALESCE(?, min_price),
      max_price = COALESCE(?, max_price),
      profit_margin = COALESCE(?, profit_margin),
      estimated_hours = COALESCE(?, estimated_hours),
      is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(
    name,
    description,
    price,
    min_price,
    max_price,
    profit_margin,
    estimated_hours,
    is_active !== undefined ? (is_active ? 1 : 0) : null,
    id
  );
  
  const updatedService = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'services', id, service, updatedService, req);
  
  res.json({
    success: true,
    message: 'Service updated successfully',
    data: updatedService
  });
}));

router.delete('/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
  if (!service) {
    throw new NotFoundError('Service');
  }
  
  const repairCount = db.prepare('SELECT COUNT(*) as count FROM repairs WHERE service_id = ?').get(id);
  if (repairCount.count > 0) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete service with existing repairs',
      message: `This service is used in ${repairCount.count} repair(s). Deactivate it instead.`
    });
  }
  
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'services', id, service, null, req);
  
  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
}));

router.get('/category/:category', authenticate, asyncHandler(async (req, res) => {
  const { category } = req.params;
  
  if (!Object.values(SERVICE_CATEGORIES).includes(category)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid category'
    });
  }
  
  const db = getDatabase();
  
  const services = db.prepare(`
    SELECT * FROM services
    WHERE category = ? AND is_active = 1
    ORDER BY name
  `).all(category);
  
  res.json({
    success: true,
    data: services,
    total: services.length
  });
}));

router.get('/phone-models/list', authenticate, asyncHandler(async (req, res) => {
  const { brand, search } = req.query;
  const db = getDatabase();
  
  let whereClause = 'is_active = 1';
  const params = [];
  
  if (brand) {
    whereClause += ' AND brand = ?';
    params.push(brand);
  }
  
  if (search) {
    whereClause += ' AND (brand LIKE ? OR model LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  const phoneModels = db.prepare(`
    SELECT * FROM phone_models
    WHERE ${whereClause}
    ORDER BY brand, model
  `).all(...params);
  
  const brands = db.prepare('SELECT DISTINCT brand FROM phone_models WHERE is_active = 1 ORDER BY brand').all();
  
  res.json({
    success: true,
    data: phoneModels,
    brands: brands.map(b => b.brand),
    total: phoneModels.length
  });
}));

router.get('/phone-models/:id/quote', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const phoneModel = db.prepare('SELECT * FROM phone_models WHERE id = ?').get(id);
  
  if (!phoneModel) {
    throw new NotFoundError('Phone model');
  }
  
  res.json({
    success: true,
    data: {
      phone: phoneModel,
      quotes: {
        screen_replacement: phoneModel.screen_price,
        battery_replacement: phoneModel.battery_price,
        charging_port_repair: phoneModel.charging_port_price,
        back_panel_replacement: phoneModel.back_panel_price,
        software_repair: phoneModel.software_price || 500
      }
    }
  });
}));

router.post('/phone-models', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { brand, model, screen_price, battery_price, charging_port_price, back_panel_price, software_price } = req.body;
  const db = getDatabase();
  
  const existingModel = db.prepare('SELECT id FROM phone_models WHERE brand = ? AND model = ?').get(brand, model);
  if (existingModel) {
    throw new ConflictError('Phone model already exists');
  }
  
  const stmt = db.prepare(`
    INSERT INTO phone_models (brand, model, screen_price, battery_price, charging_port_price, back_panel_price, software_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(brand, model, screen_price, battery_price, charging_port_price, back_panel_price, software_price || 500);
  
  const phoneModel = db.prepare('SELECT * FROM phone_models WHERE id = ?').get(result.lastInsertRowid);
  
  res.status(201).json({
    success: true,
    message: 'Phone model added successfully',
    data: phoneModel
  });
}));

router.put('/phone-models/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { screen_price, battery_price, charging_port_price, back_panel_price, software_price, is_active } = req.body;
  const db = getDatabase();
  
  const phoneModel = db.prepare('SELECT * FROM phone_models WHERE id = ?').get(id);
  if (!phoneModel) {
    throw new NotFoundError('Phone model');
  }
  
  db.prepare(`
    UPDATE phone_models SET
      screen_price = COALESCE(?, screen_price),
      battery_price = COALESCE(?, battery_price),
      charging_port_price = COALESCE(?, charging_port_price),
      back_panel_price = COALESCE(?, back_panel_price),
      software_price = COALESCE(?, software_price),
      is_active = COALESCE(?, is_active),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(screen_price, battery_price, charging_port_price, back_panel_price, software_price, is_active !== undefined ? (is_active ? 1 : 0) : null, id);
  
  const updatedModel = db.prepare('SELECT * FROM phone_models WHERE id = ?').get(id);
  
  res.json({
    success: true,
    message: 'Phone model updated successfully',
    data: updatedModel
  });
}));

router.delete('/phone-models/:id', authenticate, isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  const phoneModel = db.prepare('SELECT * FROM phone_models WHERE id = ?').get(id);
  if (!phoneModel) {
    throw new NotFoundError('Phone model');
  }
  
  db.prepare('DELETE FROM phone_models WHERE id = ?').run(id);
  
  res.json({
    success: true,
    message: 'Phone model deleted successfully'
  });
}));

module.exports = router;
