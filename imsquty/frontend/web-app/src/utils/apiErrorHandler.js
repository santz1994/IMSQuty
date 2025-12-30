/**
 * API Error Handler Utility
 * Centralizes error handling and provides consistent user-friendly error messages
 * 
 * Usage:
 *   try {
 *     const response = await assetService.list();
 *   } catch (error) {
 *     const errorInfo = handleApiError(error, dispatch);
 *     console.log(errorInfo.message, errorInfo.code);
 *   }
 */

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

const errorMessages = {
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again',
  [ErrorCodes.UNAUTHORIZED]: 'Your session has expired. Please log in again',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCodes.CONFLICT]: 'A conflict occurred. Please refresh and try again',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'You are making requests too quickly. Please wait a moment',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later',
  [ErrorCodes.GATEWAY_TIMEOUT]: 'The request took too long. Please try again',
  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again',
  [ErrorCodes.NETWORK_ERROR]: 'Network connection error. Please check your internet and try again'
};

const recoveryHints = {
  [ErrorCodes.VALIDATION_ERROR]: 'Check form fields and ensure all required fields are filled correctly',
  [ErrorCodes.UNAUTHORIZED]: 'Your session expired. Please log in to continue',
  [ErrorCodes.FORBIDDEN]: 'Contact your administrator if you need access to this resource',
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Wait a few seconds before making another request',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Try again in a moment - the service is being recovered',
  [ErrorCodes.NETWORK_ERROR]: 'Check your internet connection and try again'
};

/**
 * Determine error code from API response
 */
const getErrorCode = (error) => {
  // API error response
  if (error.response?.data?.error?.code) {
    return error.response.data.error.code;
  }

  // HTTP status codes
  const status = error.response?.status;
  switch (status) {
    case 422:
      return ErrorCodes.VALIDATION_ERROR;
    case 401:
      return ErrorCodes.UNAUTHORIZED;
    case 403:
      return ErrorCodes.FORBIDDEN;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 409:
      return ErrorCodes.CONFLICT;
    case 429:
      return ErrorCodes.RATE_LIMIT_EXCEEDED;
    case 503:
      return ErrorCodes.SERVICE_UNAVAILABLE;
    case 504:
      return ErrorCodes.GATEWAY_TIMEOUT;
    case 500:
      return ErrorCodes.INTERNAL_ERROR;
    default:
      break;
  }

  // Network errors
  if (error.code === 'ECONNABORTED') {
    return ErrorCodes.GATEWAY_TIMEOUT;
  }
  if (!error.response) {
    return ErrorCodes.NETWORK_ERROR;
  }

  return ErrorCodes.INTERNAL_ERROR;
};

/**
 * Main error handler - returns structured error information
 */
export const handleApiError = (error, dispatch) => {
  const errorCode = getErrorCode(error);
  const userMessage = errorMessages[errorCode] || 'An unexpected error occurred';
  const recoveryHint = recoveryHints[errorCode];

  const errorInfo = {
    code: errorCode,
    message: userMessage,
    recoveryHint,
    details: null,
    originalError: error
  };

  // Extract validation errors
  if (errorCode === ErrorCodes.VALIDATION_ERROR) {
    const validationErrors = error.response?.data?.error?.validationErrors;
    if (validationErrors) {
      errorInfo.details = validationErrors;
    }
  }

  // Dispatch to Redux if dispatcher provided
  if (dispatch) {
    dispatch({
      type: 'SHOW_ERROR_NOTIFICATION',
      payload: {
        message: userMessage,
        code: errorCode,
        details: errorInfo.details,
        recoveryHint
      }
    });
  }

  // Log for debugging
  console.error(`[API Error] ${errorCode}:`, {
    status: error.response?.status,
    message: userMessage,
    details: error.response?.data?.error
  });

  return errorInfo;
};

/**
 * Specific error handlers for common scenarios
 */
export const handleValidationErrors = (errors) => {
  const formattedErrors = {};
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      formattedErrors[error.field] = error.message;
    });
  } else if (typeof errors === 'object') {
    Object.assign(formattedErrors, errors);
  }

  return formattedErrors;
};

/**
 * Determine if error is retryable
 */
export const isRetryableError = (error) => {
  const retryableCodes = [
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    ErrorCodes.SERVICE_UNAVAILABLE,
    ErrorCodes.GATEWAY_TIMEOUT,
    ErrorCodes.NETWORK_ERROR
  ];

  const errorCode = getErrorCode(error);
  return retryableCodes.includes(errorCode);
};

/**
 * Format error for display in UI
 */
export const formatErrorForDisplay = (error) => {
  const errorInfo = typeof error === 'string' 
    ? { message: error, code: ErrorCodes.INTERNAL_ERROR }
    : handleApiError(error);

  return {
    title: 'Error',
    message: errorInfo.message,
    details: errorInfo.details,
    hint: errorInfo.recoveryHint,
    code: errorInfo.code,
    severity: getSeverity(errorInfo.code)
  };
};

/**
 * Determine severity level for error
 */
const getSeverity = (code) => {
  switch (code) {
    case ErrorCodes.RATE_LIMIT_EXCEEDED:
    case ErrorCodes.VALIDATION_ERROR:
      return 'warning';
    case ErrorCodes.UNAUTHORIZED:
    case ErrorCodes.FORBIDDEN:
      return 'warning';
    default:
      return 'error';
  }
};

export default {
  handleApiError,
  handleValidationErrors,
  isRetryableError,
  formatErrorForDisplay,
  ErrorCodes
};
