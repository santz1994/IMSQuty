/**
 * Advanced Rate Limiting Configuration
 * Implements tiered, context-aware rate limiting
 */

const rateLimit = require('express-rate-limit');

class RateLimitConfig {
  /**
   * General API rate limiter - 150 req/min
   * Suitable for normal CRUD operations
   */
  static generalLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 150, // 150 requests
      message: {
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.user?.role === 'admin' // Exempt admins
    });
  }

  /**
   * Authentication limiter - 10 attempts/min
   * Prevents brute force attacks
   */
  static authLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 attempts (allows for typos)
      message: {
        success: false,
        message: 'Too many login attempts. Please try again in 1 minute.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Strict limiter for sensitive operations - 30 req/min
   * For data modifications, deletions
   */
  static strictLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 requests
      message: {
        success: false,
        message: 'Too many sensitive operations. Please slow down.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Export/download limiter - 5 req/min
   * Prevents bulk data extraction
   */
  static exportLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // 5 exports
      message: {
        success: false,
        message: 'Too many export requests. Please wait before trying again.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * WebSocket connection limiter
   */
  static wsLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 20, // 20 connections
      message: {
        success: false,
        message: 'Too many connection attempts.'
      }
    });
  }

  /**
   * Per-user rate limiter (stores in req.user.id)
   * Allows higher limits for authenticated users
   */
  static userBasedLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: (req) => {
        if (!req.user) return 50; // Anonymous: 50 req/min
        if (req.user.role === 'admin') return 500; // Admin: 500 req/min
        if (req.user.role === 'manager') return 200; // Manager: 200 req/min
        return 100; // Regular user: 100 req/min
      },
      keyGenerator: (req) => req.user?.id || req.ip,
      message: {
        success: false,
        message: 'Rate limit exceeded for your account tier.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Combined middleware for public endpoints
   */
  static publicEndpointLimiter() {
    return [
      this.generalLimiter(),
      // Additional checks can be added here
    ];
  }

  /**
   * Combined middleware for protected endpoints
   */
  static protectedEndpointLimiter() {
    return [
      this.userBasedLimiter()
    ];
  }

  /**
   * Combined middleware for auth endpoints
   */
  static authEndpointLimiter() {
    return [
      this.authLimiter()
    ];
  }

  /**
   * Combined middleware for sensitive operations
   */
  static sensitiveOperationLimiter() {
    return [
      this.strictLimiter()
    ];
  }

  /**
   * Combined middleware for exports
   */
  static exportOperationLimiter() {
    return [
      this.exportLimiter()
    ];
  }
}

module.exports = RateLimitConfig;
