import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/models/user_model.dart';
import 'package:imsquty_mobile/utils/logger.dart';
import 'api_service.dart';
import 'storage_service.dart';

/// Auth Service - Authentication and token management
/// Handles login, logout, token refresh, and session validation
class AuthService {
  static final AuthService _instance = AuthService._internal();
  final ApiService _apiService;
  final StorageService _storageService;

  factory AuthService({
    ApiService? apiService,
    StorageService? storageService,
  }) {
    if (apiService != null) {
      _instance._apiService = apiService;
    }
    if (storageService != null) {
      _instance._storageService = storageService;
    }
    return _instance;
  }

  AuthService._internal()
    : _apiService = ApiService(),
      _storageService = StorageService();

  /// Initialize services
  void initialize() {
    _apiService.initialize();
    _storageService.initialize();
    AppLogger.info('Auth service initialized');
  }

  // Authentication endpoints

  /// Login with email and password
  /// Returns user and tokens on success
  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      AppLogger.info('Attempting login for: $email');

      const endpoint = '${ApiConfig.auth}/login';

      final response = await _apiService.post<Map<String, dynamic>>(
        endpoint,
        data: {'email': email, 'password': password},
      );

      final loginResponse = LoginResponse.fromJson(response);

      // Save tokens
      await _storageService.saveToken(loginResponse.token);
      if (loginResponse.refreshToken != null) {
        await _storageService.saveRefreshToken(loginResponse.refreshToken!);
      }

      // Cache user data
      await _storageService.saveUserData(
        loginResponse.user.toJson().toString(),
      );

      AppLogger.info('Login successful for user: ${loginResponse.user.email}');
      return loginResponse;
    } on ApiException {
      AppLogger.error('Login failed: API error');
      rethrow;
    } catch (e) {
      AppLogger.error('Login failed', error: e);
      throw ApiException(message: 'Login failed. Please try again.');
    }
  }

  /// Register new account
  Future<LoginResponse> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      AppLogger.info('Attempting registration for: $email');

      const endpoint = '${ApiConfig.auth}/register';

      final response = await _apiService.post<Map<String, dynamic>>(
        endpoint,
        data: {
          'name': name,
          'email': email,
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      final loginResponse = LoginResponse.fromJson(response);

      // Save tokens
      await _storageService.saveToken(loginResponse.token);
      if (loginResponse.refreshToken != null) {
        await _storageService.saveRefreshToken(loginResponse.refreshToken!);
      }

      AppLogger.info('Registration successful');
      return loginResponse;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Registration failed', error: e);
      throw ApiException(message: 'Registration failed. Please try again.');
    }
  }

  /// Refresh access token
  /// Uses refresh token to get new access token
  Future<String> refreshToken() async {
    try {
      AppLogger.info('Refreshing access token');

      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken == null) {
        throw AuthException(
          statusCode: 401,
          message: 'No refresh token available',
        );
      }

      const endpoint = '${ApiConfig.auth}/refresh';

      final response = await _apiService.post<Map<String, dynamic>>(
        endpoint,
        data: {'refresh_token': refreshToken},
      );

      if (!response.containsKey('token')) {
        throw ApiException(message: 'Invalid refresh response');
      }

      final newToken = response['token'] as String;

      // Update stored token
      await _storageService.saveToken(newToken);

      AppLogger.info('Token refreshed successfully');
      return newToken;
    } on ApiException {
      AppLogger.error('Token refresh failed');
      rethrow;
    } catch (e) {
      AppLogger.error('Token refresh failed', error: e);
      throw AuthException(statusCode: 401, message: 'Failed to refresh token');
    }
  }

  /// Logout - invalidate session and clear stored data
  Future<void> logout() async {
    try {
      AppLogger.info('Logging out');

      // Optional: Call logout endpoint if backend supports it
      try {
        const endpoint = '${ApiConfig.auth}/logout';
        await _apiService.post(endpoint);
      } catch (e) {
        AppLogger.warning('Logout endpoint call failed: $e');
        // Continue with local logout even if endpoint fails
      }

      // Clear all stored authentication data
      await _storageService.deleteToken();
      await _storageService.deleteRefreshToken();
      await _storageService.deleteUserData();

      AppLogger.info('Logout successful');
    } catch (e) {
      AppLogger.error('Logout error', error: e);
      // Ensure local data is cleared even if errors occur
      try {
        await _storageService.clearAll();
      } catch (_) {}
      rethrow;
    }
  }

  /// Verify current session is valid
  Future<bool> verifySession() async {
    try {
      AppLogger.info('Verifying session');

      // Check if token exists
      final hasToken = await _storageService.hasToken();
      if (!hasToken) {
        AppLogger.info('No valid token found');
        return false;
      }

      // Optional: Call verify endpoint
      try {
        const endpoint = '${ApiConfig.auth}/me';
        await _apiService.get(endpoint);
        AppLogger.info('Session verified');
        return true;
      } catch (e) {
        AppLogger.warning('Session verification failed: $e');
        return false;
      }
    } catch (e) {
      AppLogger.error('Session verification error', error: e);
      return false;
    }
  }

  /// Get current user from cache
  Future<User?> getCachedUser() async {
    try {
      final userJson = await _storageService.getUserData();
      if (userJson == null) {
        return null;
      }

      // Parse from cached JSON string
      // Note: This is a simple implementation; in production use json_serializable
      AppLogger.debug('User data retrieved from cache');
      return null; // Implement proper JSON deserialization with json_serializable
    } catch (e) {
      AppLogger.error('Failed to get cached user', error: e);
      return null;
    }
  }

  // Token utilities

  /// Get stored JWT token
  Future<String?> getToken() => _storageService.getToken();

  /// Check if user is authenticated
  Future<bool> isAuthenticated() => _storageService.hasToken();

  /// Clear all authentication data
  Future<void> clearAuth() async {
    await _storageService.deleteToken();
    await _storageService.deleteRefreshToken();
    await _storageService.deleteUserData();
  }

  /// Request password reset
  Future<void> requestPasswordReset(String email) async {
    try {
      AppLogger.info('Requesting password reset for: $email');

      const endpoint = '${ApiConfig.auth}/password/forgot';

      await _apiService.post(endpoint, data: {'email': email});

      AppLogger.info('Password reset email sent');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Password reset request failed', error: e);
      throw ApiException(message: 'Failed to request password reset');
    }
  }

  /// Reset password with token
  Future<void> resetPassword({
    required String email,
    required String token,
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      AppLogger.info('Resetting password for: $email');

      const endpoint = '${ApiConfig.auth}/password/reset';

      await _apiService.post(
        endpoint,
        data: {
          'email': email,
          'token': token,
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      AppLogger.info('Password reset successful');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Password reset failed', error: e);
      throw ApiException(message: 'Failed to reset password');
    }
  }
}
