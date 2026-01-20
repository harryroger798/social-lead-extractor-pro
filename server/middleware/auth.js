const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/db');
const { ROLES } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'byteworld-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'No token provided'
    });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
  
  const db = getDatabase();
  const user = db.prepare('SELECT id, username, email, role, is_active FROM users WHERE id = ?').get(decoded.id);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found',
      message: 'User associated with this token no longer exists'
    });
  }
  
  if (!user.is_active) {
    return res.status(403).json({
      success: false,
      error: 'Account disabled',
      message: 'Your account has been disabled'
    });
  }
  
  req.user = user;
  next();
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
}

function isAdmin(req, res, next) {
  return authorize(ROLES.ADMIN)(req, res, next);
}

function isAdminOrTechnician(req, res, next) {
  return authorize(ROLES.ADMIN, ROLES.TECHNICIAN)(req, res, next);
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (decoded) {
    const db = getDatabase();
    const user = db.prepare('SELECT id, username, email, role, is_active FROM users WHERE id = ?').get(decoded.id);
    if (user && user.is_active) {
      req.user = user;
    }
  }
  
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  isAdmin,
  isAdminOrTechnician,
  optionalAuth,
  JWT_SECRET
};
