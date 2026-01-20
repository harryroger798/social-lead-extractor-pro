const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/db');
const { generateToken, authenticate } = require('../middleware/auth');
const { asyncHandler, ValidationError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');
const { logActivity, ACTIVITY_ACTIONS } = require('../middleware/logging');
const { ROLES, PASSWORD_MIN_LENGTH } = require('../config/constants');

const router = express.Router();

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { username, email, password, role = ROLES.TECHNICIAN } = req.body;
  const db = getDatabase();
  
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existingUser) {
    throw new ConflictError('User with this email or username already exists');
  }
  
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(username, email, passwordHash, role);
  
  const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  
  const token = generateToken(user);
  
  logActivity(user.id, ACTIVITY_ACTIONS.CREATE, 'users', user.id, null, { username, email, role }, req);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      },
      token
    }
  });
}));

router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { email, password } = req.body;
  const db = getDatabase();
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  if (!user.is_active) {
    throw new UnauthorizedError('Your account has been disabled');
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }
  
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
  
  const token = generateToken(user);
  
  logActivity(user.id, ACTIVITY_ACTIONS.LOGIN, 'users', user.id, null, null, req);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        last_login: new Date().toISOString()
      },
      token
    }
  });
}));

router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const user = db.prepare(`
    SELECT id, username, email, role, is_active, last_login, created_at, updated_at
    FROM users WHERE id = ?
  `).get(req.user.id);
  
  res.json({
    success: true,
    data: user
  });
}));

router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  logActivity(req.user.id, ACTIVITY_ACTIONS.LOGOUT, 'users', req.user.id, null, null, req);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  
  const { currentPassword, newPassword } = req.body;
  const db = getDatabase();
  
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
  
  const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  
  const salt = await bcrypt.genSalt(12);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);
  
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newPasswordHash, req.user.id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'users', req.user.id, null, { action: 'password_change' }, req);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

router.get('/users', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const db = getDatabase();
  const users = db.prepare(`
    SELECT id, username, email, role, is_active, last_login, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  
  res.json({
    success: true,
    data: users,
    total: users.length
  });
}));

router.put('/users/:id', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const { id } = req.params;
  const { role, is_active } = req.body;
  const db = getDatabase();
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  const updates = [];
  const params = [];
  
  if (role !== undefined && Object.values(ROLES).includes(role)) {
    updates.push('role = ?');
    params.push(role);
  }
  
  if (is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(is_active ? 1 : 0);
  }
  
  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
  
  const updatedUser = db.prepare(`
    SELECT id, username, email, role, is_active, last_login, created_at, updated_at
    FROM users WHERE id = ?
  `).get(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.UPDATE, 'users', id, user, updatedUser, req);
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
}));

router.delete('/users/:id', authenticate, asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }
  
  const { id } = req.params;
  const db = getDatabase();
  
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Cannot delete your own account'
    });
  }
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  
  logActivity(req.user.id, ACTIVITY_ACTIONS.DELETE, 'users', id, user, null, req);
  
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

module.exports = router;
