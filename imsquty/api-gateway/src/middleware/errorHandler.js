/**
 * Enhanced Error Handling Middleware
 * Provides consistent, informative error responses across all services
 */

class ErrorHandler {
  /**
   * Standardized error response format
   */
  static format(error, context = 'request') {
    return {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        context,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    };
  }

  /**
   * HTTP status code mapping
   */
  static getStatusCode(error) {
    if (error.statusCode) return error.statusCode;

    const codeMap = {
      'VALIDATION_ERROR': 400,
      'UNAUTHORIZED': 401,
      'FORBIDDEN': 403,
      'NOT_FOUND': 404,
      'CONFLICT': 409,
      'UNPROCESSABLE_ENTITY': 422,
      'RATE_LIMIT_EXCEEDED': 429,
      'SERVICE_UNAVAILABLE': 503,
      'GATEWAY_TIMEOUT': 504,
      'INTERNAL_ERROR': 500
    };

    return codeMap[error.code] || 500;
  }

  /**
   * Express error handling middleware
   */
  static middleware() {
    return (err, req, res, next) => {
      const statusCode = this.getStatusCode(err);
      const errorResponse = this.format(err, req.path);

      // Log error
      console.error(`[ErrorHandler] ${statusCode} ${err.code || 'ERROR'}: ${err.message}`);
      if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
      }

      res.status(statusCode).json(errorResponse);
    };
  }

  /**
   * Create custom error with code and status
   */
  static createError(message, code = 'INTERNAL_ERROR', statusCode = 500) {
    const error = new Error(message);
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  /**
   * Handle validation errors
   */
  static validationError(details) {
    const error = new Error('Validation failed');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    error.details = details;
    return error;
  }

  /**
   * Handle service connection errors
   */
  static serviceUnavailableError(serviceName) {
    return this.createError(
      `${serviceName} service is currently unavailable`,
      'SERVICE_UNAVAILABLE',
      503
    );
  }

  /**
   * Handle timeout errors
   */
  static timeoutError(serviceName) {
    return this.createError(
      `Request to ${serviceName} timed out`,
      'GATEWAY_TIMEOUT',
      504
    );
  }

  /**
   * Handle authentication errors
   */
  static authenticationError(message = 'Authentication required') {
    return this.createError(message, 'UNAUTHORIZED', 401);
  }

  /**
   * Handle authorization errors
   */
  static authorizationError(message = 'Insufficient permissions') {
    return this.createError(message, 'FORBIDDEN', 403);
  }

  /**
   * Handle not found errors
   */
  static notFoundError(resource) {
    return this.createError(`${resource} not found`, 'NOT_FOUND', 404);
  }

  /**
   * Handle conflict errors (e.g., duplicate entries)
   */
  static conflictError(message) {
    return this.createError(message, 'CONFLICT', 409);
  }

  /**
   * Handle rate limit errors
   */
  static rateLimitError() {
    return this.createError(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  /**
   * Async error wrapper for express route handlers
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Error recovery suggestions based on error type
   */
  static getRecoverySuggestion(error) {
    const suggestions = {
      'SERVICE_UNAVAILABLE': 'Please try again in a few moments',
      'GATEWAY_TIMEOUT': 'The service took too long to respond. Check your connection.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'UNAUTHORIZED': 'Please log in and try again.',
      'FORBIDDEN': 'You do not have permission to access this resource.',
      'NOT_FOUND': 'The requested resource does not exist.',
      'RATE_LIMIT_EXCEEDED': 'You are making requests too quickly. Please slow down.'
    };

    return suggestions[error.code] || 'Please try again later';
  }
}

module.exports = ErrorHandler;
