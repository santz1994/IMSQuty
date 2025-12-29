/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verify JWT token and extract user data
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.sub || decoded.user_id || decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };

    logger.info(`Authenticated user: ${req.user.email}`);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    logger.error(`Auth error: ${err.message}`);
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication - doesn't fail if token is missing, but validates if present
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // No token is fine, just continue
      return next();
    }

    // Verify token if provided
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.sub || decoded.user_id || decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };

    logger.info(`Authenticated user: ${req.user.email}`);
    next();
  } catch (err) {
    // Token provided but invalid - fail
    logger.error(`Optional auth error: ${err.message}`);
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
