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

// Security headers - disable some policies that can interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - MUST come after helmet
// Use dynamic origin to reflect the requesting origin in Access-Control-Allow-Origin header
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',  // web-app
  'http://localhost:5174',  // admin-panel
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Don't use body parser yet - let proxies handle raw body first
// Body parsers will be applied selectively after defining non-proxy routes

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
  // Skip authentication for OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required'
    });
  }

  const token = authHeader.substring(7);

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    logger.info(`Using JWT_SECRET: ${jwtSecret.substring(0, 10)}...`);
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error.message);
    logger.error('Error details:', error);
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
const proxyOptions = (target, serviceName, skipPathRewrite = false) => ({
  target,
  changeOrigin: true,
  timeout: 30000, // 30 seconds
  proxyTimeout: 30000, // 30 seconds
  pathRewrite: skipPathRewrite ? undefined : (path) => {
    // Remove /api/v1/{service} prefix
    return path.replace(/^\/api\/v1\/[^/]+/, '/api/v1');
  },
  logLevel: 'debug', // Enable debug logging
  onError: (err, req, res) => {
    logger.error(`Proxy error for ${serviceName} (${target}):`, err.message);

    // NEW: Circuit breaker handling
    const breaker = circuitBreakers[serviceName];
    if (breaker) {
      breaker.recordFailure();
      logger.warn(`Circuit breaker state for ${serviceName}: ${breaker.state}`);
    }

    // Set CORS headers on error response
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Return standardized error response
    const statusCode = ErrorHandler.getStatusCode(err);
    const errorBody = ErrorHandler.format(err, `proxy-${serviceName}`);

    return res.status(statusCode).json(errorBody);
  },
  onProxyReq: (proxyReq, req) => {
    logger.info(`Proxying ${req.method} ${req.url} to ${target}${req.url}`);

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

    // Ensure CORS headers are set on proxy response
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

    // Log response
    logger.info(`${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  }
});

// ============================================
// ROUTES
// ============================================

// Health check

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

// Auth Service (no authentication required) - Using real auth-service
app.use('/api/v1/auth', authLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('auth-service'), 'auth', true)));

// NOW add body parsers for authenticated routes (after auth proxy which handles raw body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User Service - UPDATED with dynamic service resolution
app.use('/api/v1/users', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('user-service'), 'user', true)));

// Roles & Permissions (part of user-service)
app.use('/api/v1/roles', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('user-service'), 'user', true)));
app.use('/api/v1/permissions', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('user-service'), 'user', true)));

// Asset Service - UPDATED with dynamic service resolution
app.use('/api/v1/assets', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('asset-service'), 'asset', true)));

// Ticket Service - UPDATED with dynamic service resolution
app.use('/api/v1/tickets', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('ticket-service'), 'ticket', true)));

// Inventory Service - UPDATED with dynamic service resolution
app.use('/api/v1/inventory', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('inventory-service'), 'inventory', true)));

// Financial Service - UPDATED with stricter rate limiting for data export
app.use('/api/v1/financial', authenticateJWT, exportLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('financial-service'), 'financial', true)));

// Meeting Room Service - UPDATED with dynamic service resolution
app.use('/api/v1/meeting-rooms', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('meeting-room-service'), 'meetingRoom', true)));

// Master Data Service - UPDATED with admin rate limiting
app.use('/api/v1/master-data', authenticateJWT, adminLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('master-data-service'), 'masterData', true)));

// Reporting Service - UPDATED with export rate limiting
app.use('/api/v1/reporting', authenticateJWT, exportLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('reporting-service'), 'reporting', true)));

// Notification Service - UPDATED with dynamic service resolution
app.use('/api/v1/notifications', authenticateJWT, generalLimiter, createProxyMiddleware(proxyOptions(serviceRegistry.getServiceUrl('notification-service'), 'notification', true)));

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  const allServices = serviceRegistry.getAllServices();
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: Object.keys(allServices)
  });
});

// ============================================
// ERROR HANDLING (UPDATED)
// ============================================

// 404 handler - UPDATED: Using new error handler
app.use((req, res) => {
  const notFoundError = new Error('Endpoint not found');
  notFoundError.code = 'NOT_FOUND';
  const statusCode = ErrorHandler.getStatusCode(notFoundError);
  const errorBody = ErrorHandler.format(notFoundError, `404_${req.method}_${req.path}`);
  res.status(statusCode).json(errorBody);
});

// Global error handler - UPDATED: Using new error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  const statusCode = ErrorHandler.getStatusCode(err);
  const errorBody = ErrorHandler.format(err, 'global_error_handler');
  res.status(statusCode).json(errorBody);
});

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`✅ API Gateway running on port ${PORT}`);
  logger.info('\n📋 Service Configuration:');
  const allServices = serviceRegistry.getAllServices();
  Object.entries(allServices).forEach(([name, service]) => {
    logger.info(`   ✓ ${name}: ${service.instances.join(', ')}`);
  });

  logger.info('\n⚡ Resilience Features Enabled:');
  const breakers = Object.keys(circuitBreakers);
  const authBreaker = circuitBreakers[breakers[0]] || { failureThreshold: 5 };
  logger.info(`   ✓ Circuit Breaker (threshold: ${authBreaker.failureThreshold || 5}, ${breakers.length} services)`);
  logger.info(`   ✓ Retry Manager (max retries: ${retryManager.maxRetries})`);
  logger.info(`   ✓ Rate Limiting (5 tiers configured)`);
  logger.info(`   ✓ Error Handler (standardized responses)`);
  logger.info(`   ✓ Response Formatter (consistent format)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
