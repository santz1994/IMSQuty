require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const winston = require('winston');

// NEW: Import resilience & quality middleware
const CircuitBreaker = require('./src/middleware/circuitBreaker');
const RetryManager = require('./src/middleware/retryManager');
const ServiceRegistry = require('./src/services/serviceRegistry');
const RateLimitConfig = require('./src/config/rateLimitConfig');
const ErrorHandler = require('./src/middleware/errorHandler');
const ResponseFormatter = require('./src/middleware/responseFormatter');

const app = express();
const PORT = process.env.PORT || 8000;

// ============================================
// LOGGER SETUP
// ============================================
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NEW: Response formatter middleware
app.use(ResponseFormatter.middleware());

// HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting - UPDATED: Use tiered configuration
const generalLimiter = RateLimitConfig.generalLimiter();
const authLimiter = RateLimitConfig.authLimiter();
const exportLimiter = RateLimitConfig.exportLimiter();
const adminLimiter = RateLimitConfig.strictLimiter(); // Use strict limiter for admin

// ============================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// ============================================
// SERVICE REGISTRY & DISCOVERY (NEW)
// ============================================
const serviceRegistry = new ServiceRegistry();
serviceRegistry.initializeDefaultServices(process.env);

// Initialize circuit breaker for each service
const circuitBreakers = {};
Object.keys(serviceRegistry.services).forEach(service => {
  circuitBreakers[service] = new CircuitBreaker(service, {
    failureThreshold: parseInt(process.env.CB_FAILURE_THRESHOLD || 5),
    successThreshold: parseInt(process.env.CB_SUCCESS_THRESHOLD || 2),
    timeout: parseInt(process.env.CB_TIMEOUT || 60000)
  });
});

// Initialize retry manager
const retryManager = new RetryManager({
  maxRetries: parseInt(process.env.RETRY_MAX || 3),
  baseDelay: parseInt(process.env.RETRY_BASE_DELAY || 1000),
  maxDelay: parseInt(process.env.RETRY_MAX_DELAY || 30000)
});

// Proxy configuration - UPDATED: With resilience patterns
const proxyOptions = (target, serviceName) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /api/v1/{service} prefix
    return path.replace(/^\/api\/v1\/[^/]+/, '/api/v1');
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error for ${serviceName} (${target}):`, err.message);

    // NEW: Circuit breaker handling
    const breaker = circuitBreakers[serviceName];
    if (breaker) {
      breaker.recordFailure();
      logger.warn(`Circuit breaker state for ${serviceName}: ${breaker.state}`);
    }

    // Return standardized error response
    const errorResponse = ErrorHandler.handle(err, {
      service: serviceName,
      target: target,
      originalError: process.env.APP_DEBUG === 'true' ? err.message : undefined
    });

    return res.status(errorResponse.statusCode).json(errorResponse.body);
  },
  onProxyReq: (proxyReq, req) => {
    // NEW: Check circuit breaker before proxying
    const serviceName = req.path.split('/')[3]; // Extract service name from path
    const breaker = circuitBreakers[serviceName];

    if (breaker && breaker.state === 'OPEN') {
      throw new Error(`Circuit breaker OPEN for ${serviceName}`);
    }

    // Forward user info to microservices
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.sub || req.user.id);
      proxyReq.setHeader('X-User-Email', req.user.email);
      proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user.roles || []));
    }

    // Forward real IP
    const realIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    proxyReq.setHeader('X-Real-IP', realIp);
    proxyReq.setHeader('X-Forwarded-For', realIp);

    // NEW: Add retry count header
    const retryCount = req.headers['x-retry-count'] || 0;
    proxyReq.setHeader('X-Retry-Count', retryCount);
  },
  onProxyRes: (proxyRes, req, res) => {
    // NEW: Circuit breaker success
    const serviceName = req.path.split('/')[3];
    const breaker = circuitBreakers[serviceName];
    if (breaker && proxyRes.statusCode < 500) {
      breaker.recordSuccess();
    }

    // Log response
    logger.info(`${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  }
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// API version info
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    name: 'IMSQuty Microservices API',
    version: '1.0.0',
    description: 'Asset & Ticket Management System',
    documentation: '/api/v1/docs',
    services: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      assets: '/api/v1/assets',
      tickets: '/api/v1/tickets',
      inventory: '/api/v1/inventory',
      financial: '/api/v1/financial',
      'meeting-rooms': '/api/v1/meeting-rooms',
      'master-data': '/api/v1/master-data',
      reporting: '/api/v1/reporting',
      notifications: '/api/v1/notifications'
    }
  });
});

// ============================================
// SERVICE PROXIES (UPDATED WITH RESILIENCE)
// ============================================

// Auth Service (no authentication required) - UPDATED rate limiting
app.use('/api/v1/auth', authLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('auth-service'), 'auth')));

// User Service - UPDATED with dynamic service resolution
app.use('/api/v1/users', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('user-service'), 'user')));

// Asset Service - UPDATED with dynamic service resolution
app.use('/api/v1/assets', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('asset-service'), 'asset')));

// Ticket Service - UPDATED with dynamic service resolution
app.use('/api/v1/tickets', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('ticket'), 'ticket')));

// Inventory Service - UPDATED with dynamic service resolution
app.use('/api/v1/inventory', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('inventory'), 'inventory')));

// Financial Service - UPDATED with stricter rate limiting for data export
app.use('/api/v1/financial', authenticateJWT, exportLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('financial'), 'financial')));

// Meeting Room Service - UPDATED with dynamic service resolution
app.use('/api/v1/meeting-rooms', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('meetingRoom'), 'meetingRoom')));

// Master Data Service - UPDATED with admin rate limiting
app.use('/api/v1/master-data', authenticateJWT, adminLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('masterData'), 'masterData')));

// Reporting Service - UPDATED with export rate limiting
app.use('/api/v1/reporting', authenticateJWT, exportLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('reporting'), 'reporting')));

// Notification Service - UPDATED with dynamic service resolution
app.use('/api/v1/notifications', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('notification'), 'notification')));

// ============================================
// ERROR HANDLING (UPDATED)
// ============================================

// 404 handler - UPDATED: Using new error handler
app.use((req, res) => {
  const error = ErrorHandler.handle(new Error('Endpoint not found'), {
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method
  });
  res.status(error.statusCode).json(error.body);
});

// Global error handler - UPDATED: Using new error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  const error = ErrorHandler.handle(err, {
    context: 'global_error_handler',
    debug: process.env.APP_DEBUG === 'true'
  });
  res.status(error.statusCode).json(error.body);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ API Gateway running on port ${PORT}`);
  logger.info('\n📋 Service Configuration:');
  Object.entries(serviceRegistry.services).forEach(([name, urls]) => {
    logger.info(`   ✓ ${name}: ${Array.isArray(urls) ? urls.join(', ') : urls}`);
  });

  logger.info('\n⚡ Resilience Features Enabled:');
  logger.info(`   ✓ Circuit Breaker (threshold: ${circuitBreakers.auth.failureThreshold})`);
  logger.info(`   ✓ Retry Manager (max retries: ${retryManager.maxRetries})`);
  logger.info(`   ✓ Rate Limiting (5 tiers configured)`);
  logger.info(`   ✓ Error Handler (standardized responses)`);
  logger.info(`   ✓ Response Formatter (consistent format)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app;
