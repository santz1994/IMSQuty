require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const winston = require('winston');

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

// HTTP request logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Login rate limiting (stricter)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

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
// SERVICE ROUTES CONFIGURATION
// ============================================
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
  user: process.env.USER_SERVICE_URL || 'http://user-service:8002',
  asset: process.env.ASSET_SERVICE_URL || 'http://asset-service:8003',
  ticket: process.env.TICKET_SERVICE_URL || 'http://ticket-service:8004',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:8005',
  financial: process.env.FINANCIAL_SERVICE_URL || 'http://financial-service:8006',
  meetingRoom: process.env.MEETING_ROOM_SERVICE_URL || 'http://meeting-room-service:8007',
  masterData: process.env.MASTER_DATA_SERVICE_URL || 'http://master-data-service:8008',
  reporting: process.env.REPORTING_SERVICE_URL || 'http://reporting-service:8009',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8010'
};

// Proxy configuration
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  pathRewrite: (path) => {
    // Remove /api/v1/{service} prefix
    return path.replace(/^\/api\/v1\/[^/]+/, '/api/v1');
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error for ${target}:`, err.message);
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: process.env.APP_DEBUG === 'true' ? err.message : undefined
    });
  },
  onProxyReq: (proxyReq, req) => {
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
  },
  onProxyRes: (proxyRes, req, res) => {
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
// SERVICE PROXIES
// ============================================

// Auth Service (no authentication required)
app.use('/api/v1/auth', loginLimiter, createProxyMiddleware(proxyOptions(services.auth)));

// User Service
app.use('/api/v1/users', authenticateJWT, createProxyMiddleware(proxyOptions(services.user)));

// Asset Service
app.use('/api/v1/assets', authenticateJWT, createProxyMiddleware(proxyOptions(services.asset)));

// Ticket Service
app.use('/api/v1/tickets', authenticateJWT, createProxyMiddleware(proxyOptions(services.ticket)));

// Inventory Service
app.use('/api/v1/inventory', authenticateJWT, createProxyMiddleware(proxyOptions(services.inventory)));

// Financial Service
app.use('/api/v1/financial', authenticateJWT, createProxyMiddleware(proxyOptions(services.financial)));

// Meeting Room Service
app.use('/api/v1/meeting-rooms', authenticateJWT, createProxyMiddleware(proxyOptions(services.meetingRoom)));

// Master Data Service
app.use('/api/v1/master-data', authenticateJWT, createProxyMiddleware(proxyOptions(services.masterData)));

// Reporting Service
app.use('/api/v1/reporting', authenticateJWT, createProxyMiddleware(proxyOptions(services.reporting)));

// Notification Service
app.use('/api/v1/notifications', authenticateJWT, createProxyMiddleware(proxyOptions(services.notification)));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.APP_DEBUG === 'true' ? err.stack : undefined
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service configuration:');
  Object.entries(services).forEach(([name, url]) => {
    logger.info(`  - ${name}: ${url}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = app;
