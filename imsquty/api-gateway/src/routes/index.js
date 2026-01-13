/**
 * API Gateway Routes
 * Maps all API v1 routes to microservices on localhost:8001-8010
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const { errorHandler } = require('../utils/errorHandler');

const router = express.Router();

// Service routing configuration
const SERVICES = {
  auth: 'http://localhost:8001',
  user: 'http://localhost:8002',
  asset: 'http://localhost:8003',
  ticket: 'http://localhost:8004',
  inventory: 'http://localhost:8005',
  'financial': 'http://localhost:8006',
  'master-data': 'http://localhost:8007',
  'notification': 'http://localhost:8008',
  'meeting-room': 'http://localhost:8009',
  'reporting': 'http://localhost:8010'
};

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: Object.keys(SERVICES)
  });
});

// API info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'IMSQuty API v1',
    version: '1.0.0',
    services: SERVICES,
    docs: 'https://github.com/santz1994/IMSQuty'
  });
});

// ============================================
// AUTH SERVICE - Public Routes (No Auth)
// ============================================

router.use('/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/auth': '/api/v1/auth'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward client IP
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Auth Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// Apply authentication middleware to all protected routes
router.use(authMiddleware);

// RBAC ENDPOINTS - Route to AUTH SERVICE
router.use('/roles', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/roles': '/api/v1/roles'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Auth Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

router.use('/permissions', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/permissions': '/api/v1/permissions'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Auth Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

router.use('/audit-logs', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/audit-logs': '/api/v1/audit-logs'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Auth Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// USER SERVICE
router.use('/users', createProxyMiddleware({
  target: SERVICES.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/users': '/api/v1/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user context headers
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'User Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// ASSET SERVICE
router.use('/assets', createProxyMiddleware({
  target: SERVICES.asset,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/assets': '/api/v1/assets'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Asset Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// TICKET SERVICE
router.use('/tickets', createProxyMiddleware({
  target: SERVICES.ticket,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/tickets': '/api/v1/tickets'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Ticket Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// INVENTORY SERVICE
router.use('/inventory', createProxyMiddleware({
  target: SERVICES.inventory,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/inventory': '/api/v1/inventory'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Inventory Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// FINANCIAL SERVICE
router.use('/financial', createProxyMiddleware({
  target: SERVICES.financial,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/financial': '/api/v1/financial'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Financial Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// MASTER-DATA SERVICE
router.use('/master-data', createProxyMiddleware({
  target: SERVICES['master-data'],
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/master-data': '/api/v1/master-data'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Master-Data Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// NOTIFICATION SERVICE
router.use('/notifications', createProxyMiddleware({
  target: SERVICES.notification,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/notifications': '/api/v1/notifications'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Notification Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// MEETING-ROOM SERVICE
router.use('/meeting-rooms', createProxyMiddleware({
  target: SERVICES['meeting-room'],
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/meeting-rooms': '/api/v1/meeting-rooms'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Meeting-Room Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// REPORTING SERVICE
router.use('/reports', createProxyMiddleware({
  target: SERVICES.reporting,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/reports': '/api/v1/reports'
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-User-Id', req.user?.id);
    proxyReq.setHeader('X-User-Email', req.user?.email);
    proxyReq.setHeader('X-User-Roles', JSON.stringify(req.user?.roles || []));
    proxyReq.setHeader('X-Real-IP', req.ip);
    proxyReq.setHeader('X-Forwarded-For', req.get('x-forwarded-for') || req.ip);
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      message: 'Reporting Service unavailable',
      error: process.env.DEBUG ? err.message : undefined
    });
  }
}));

// 404 - Not Found
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

module.exports = router;
