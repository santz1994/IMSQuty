// lib/exceptions/api_exception.dart

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic originalError;

  ApiException({
    required this.message,
    this.statusCode,
    this.originalError,
  });

  @override
  String toString() => message;

  factory ApiException.fromDioException(dynamic error) {
    String message = 'An error occurred';
    int? statusCode;

    if (error is DioException) {
      statusCode = error.response?.statusCode;
      
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
          message = 'Connection timeout. Please check your internet connection.';
          break;
        case DioExceptionType.sendTimeout:
          message = 'Send timeout. Please try again.';
          break;
        case DioExceptionType.receiveTimeout:
          message = 'Receive timeout. Please try again.';
          break;
        case DioExceptionType.badResponse:
          message = _handleStatusCode(statusCode);
          break;
        case DioExceptionType.cancel:
          message = 'Request was cancelled';
          break;
        case DioExceptionType.unknown:
          message = error.message ?? 'Unknown error occurred';
          break;
      }
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
      originalError: error,
    );
  }

  static String _handleStatusCode(int? statusCode) {
    switch (statusCode) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Forbidden. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An error occurred (Status: $statusCode)';
    }
  }
}

class AuthException extends ApiException {
  AuthException({required String message})
      : super(message: message, statusCode: 401);
}

class ValidationException extends ApiException {
  final Map<String, List<String>>? errors;

  ValidationException({
    required String message,
    this.errors,
  }) : super(message: message, statusCode: 422);
}

class StorageException implements Exception {
  final String message;

  StorageException(this.message);

  @override
  String toString() => message;
}

// Import Dio at the top
import 'package:dio/dio.dart' show DioException, DioExceptionType;
