/**
 * Standardized API Response Formatter
 * Ensures consistent response format across all services
 * Format: { success, data/error, message, meta }
 */

class ResponseFormatter {
  /**
   * Success response (GET, POST, PUT, PATCH)
   */
  static success(data, message = 'Operation successful', meta = {}) {
    return {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    };
  }

  /**
   * Paginated response
   */
  static paginated(items, pagination = {}) {
    return {
      success: true,
      data: items,
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || items.length,
        total: pagination.total || items.length,
        totalPages: pagination.totalPages || Math.ceil(items.length / (pagination.pageSize || 1)),
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false,
        ...pagination
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Error response
   */
  static error(message, code = 'ERROR', statusCode = 500, details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Batch operation response (bulk create/update/delete)
   */
  static batch(successful = [], failed = [], message = 'Batch operation completed') {
    return {
      success: failed.length === 0,
      data: {
        successful: successful.length,
        failed: failed.length,
        total: successful.length + failed.length,
        successfulItems: successful,
        failedItems: failed
      },
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Created resource response (201)
   */
  static created(resource, message = 'Resource created successfully') {
    return {
      success: true,
      data: resource,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        statusCode: 201
      }
    };
  }

  /**
   * Deleted resource response
   */
  static deleted(message = 'Resource deleted successfully', deletedId = null) {
    return {
      success: true,
      data: {
        id: deletedId,
        deleted: true
      },
      message,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Health check response
   */
  static health(status = 'ok', details = {}) {
    return {
      success: status === 'ok',
      status,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * File download response
   */
  static fileDownload(filename, mimetype, buffer) {
    return {
      success: true,
      file: {
        name: filename,
        type: mimetype,
        size: buffer.length,
        data: buffer.toString('base64')
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Validation error response
   */
  static validationError(errors = {}, message = 'Validation failed') {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        validationErrors: errors,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Authentication error response
   */
  static unauthorized(message = 'Authentication required') {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Authorization error response
   */
  static forbidden(message = 'Access denied') {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Middleware to attach formatter to response object
   */
  static middleware() {
    return (req, res, next) => {
      res.apiSuccess = (data, message, meta) => {
        res.status(200).json(this.success(data, message, meta));
      };

      res.apiCreated = (data, message) => {
        res.status(201).json(this.created(data, message));
      };

      res.apiDeleted = (message, id) => {
        res.status(200).json(this.deleted(message, id));
      };

      res.apiError = (message, code, statusCode) => {
        res.status(statusCode || 500).json(this.error(message, code, statusCode));
      };

      res.apiValidationError = (errors, message) => {
        res.status(400).json(this.validationError(errors, message));
      };

      res.apiUnauthorized = (message) => {
        res.status(401).json(this.unauthorized(message));
      };

      res.apiForbidden = (message) => {
        res.status(403).json(this.forbidden(message));
      };

      res.apiPaginated = (items, pagination) => {
        res.status(200).json(this.paginated(items, pagination));
      };

      res.apiBatch = (successful, failed, message) => {
        const hasFailures = failed.length > 0;
        res.status(hasFailures ? 207 : 200).json(this.batch(successful, failed, message));
      };

      next();
    };
  }
}

module.exports = ResponseFormatter;
