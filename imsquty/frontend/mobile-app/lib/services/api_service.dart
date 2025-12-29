import 'package:dio/dio.dart';
import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/utils/constants.dart';
import 'package:imsquty_mobile/utils/logger.dart';

import 'storage_service.dart';

/// API Service - Centralized HTTP client with JWT token management
/// Handles all API requests with automatic token injection and error handling
class ApiService {
  static final ApiService _instance = ApiService._internal();
  late final Dio _dio;
  final StorageService _storageService;

  factory ApiService({StorageService? storageService}) {
    if (storageService != null) {
      _instance._storageService = storageService;
    }
    return _instance;
  }

  ApiService._internal() : _storageService = StorageService();

  /// Initialize Dio client with base configuration
  void initialize() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: ApiConfig.connectTimeout,
        sendTimeout: ApiConfig.sendTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        validateStatus: (status) => true, // Handle all status codes
      ),
    );

    // Add interceptors
    _dio.interceptors.add(_TokenInterceptor(_storageService));
    _dio.interceptors.add(_LoggingInterceptor());
    _dio.interceptors.add(_ErrorInterceptor());
  }

  /// Ensure Dio is initialized
  Dio get dio {
    if (!_dioInitialized) {
      initialize();
      _dioInitialized = true;
    }
    return _dio;
  }

  static bool _dioInitialized = false;

  // Generic request methods with error handling

  /// Perform GET request
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      AppLogger.logApiCall('GET', path, queryParameters: queryParameters);

      final response = await dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onReceiveProgress: onReceiveProgress,
      );

      AppLogger.logApiResponse(response.statusCode, response.data);
      _handleResponse(response);

      return response.data as T;
    } on DioException catch (e) {
      AppLogger.logApiError('GET', path, e);
      throw _handleDioException(e);
    } catch (e) {
      AppLogger.error('Unexpected error in GET: $path', error: e);
      throw ApiException(message: 'An unexpected error occurred');
    }
  }

  /// Perform POST request
  Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      AppLogger.logApiCall('POST', path, data: data);

      final response = await dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );

      AppLogger.logApiResponse(response.statusCode, response.data);
      _handleResponse(response);

      return response.data as T;
    } on DioException catch (e) {
      AppLogger.logApiError('POST', path, e);
      throw _handleDioException(e);
    } catch (e) {
      AppLogger.error('Unexpected error in POST: $path', error: e);
      throw ApiException(message: 'An unexpected error occurred');
    }
  }

  /// Perform PUT request
  Future<T> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) async {
    try {
      AppLogger.logApiCall('PUT', path, data: data);

      final response = await dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
        onSendProgress: onSendProgress,
        onReceiveProgress: onReceiveProgress,
      );

      AppLogger.logApiResponse(response.statusCode, response.data);
      _handleResponse(response);

      return response.data as T;
    } on DioException catch (e) {
      AppLogger.logApiError('PUT', path, e);
      throw _handleDioException(e);
    } catch (e) {
      AppLogger.error('Unexpected error in PUT: $path', error: e);
      throw ApiException(message: 'An unexpected error occurred');
    }
  }

  /// Perform DELETE request
  Future<T> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      AppLogger.logApiCall('DELETE', path);

      final response = await dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );

      AppLogger.logApiResponse(response.statusCode, response.data);
      _handleResponse(response);

      return response.data as T;
    } on DioException catch (e) {
      AppLogger.logApiError('DELETE', path, e);
      throw _handleDioException(e);
    } catch (e) {
      AppLogger.error('Unexpected error in DELETE: $path', error: e);
      throw ApiException(message: 'An unexpected error occurred');
    }
  }

  /// Handle response status codes
  void _handleResponse(Response response) {
    if (response.statusCode == null || response.statusCode! >= 400) {
      throw ApiException(
        statusCode: response.statusCode ?? 500,
        message: response.data?['message'] ?? 'Request failed',
      );
    }
  }

  /// Convert DioException to custom exception
  ApiException _handleDioException(DioException e) {
    AppLogger.error('DioException: ${e.type} - ${e.message}');
    return ApiException.fromDioException(e);
  }

  /// Get current stored token
  Future<String?> getToken() => _storageService.getToken();

  /// Check if user is authenticated
  Future<bool> isAuthenticated() => _storageService.hasToken();

  /// Clear all stored data (for logout)
  Future<void> clearCache() async {
    await _storageService.clearAll();
  }
}

/// JWT Token Interceptor - Automatically injects token in request headers
class _TokenInterceptor extends Interceptor {
  final StorageService _storageService;

  _TokenInterceptor(this._storageService);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    try {
      final token = await _storageService.getToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
        AppLogger.debug('Token injected in request header');
      }
    } catch (e) {
      AppLogger.warning('Failed to inject token: $e');
    }

    return handler.next(options);
  }
}

/// Logging Interceptor - Logs all requests and responses
class _LoggingInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    AppLogger.info(
      '→ ${options.method} ${options.path}\n'
      'Headers: ${options.headers}\n'
      'QueryParams: ${options.queryParameters}',
    );
    return handler.next(options);
  }

  @override
  Future<void> onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    AppLogger.info(
      '← ${response.statusCode} ${response.requestOptions.path}\n'
      'Response: ${response.data}',
    );
    return handler.next(response);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    AppLogger.error(
      '✗ Error: ${err.requestOptions.method} ${err.requestOptions.path}\n'
      'Status: ${err.response?.statusCode}\n'
      'Message: ${err.message}',
      error: err,
    );
    return handler.next(err);
  }
}

/// Error Interceptor - Handles HTTP errors
class _ErrorInterceptor extends Interceptor {
  @override
  Future<void> onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) async {
    // Handle error status codes
    if (response.statusCode != null && response.statusCode! >= 400) {
      final dioException = DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
        error: response.data,
      );
      return handler.reject(dioException);
    }

    return handler.next(response);
  }
}
