import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/utils/constants.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Storage Service - Secure token and data persistence
/// Uses flutter_secure_storage for sensitive data and shared preferences for regular data
class StorageService {
  static final StorageService _instance = StorageService._internal();
  late final FlutterSecureStorage _secureStorage;

  factory StorageService() {
    return _instance;
  }

  StorageService._internal();

  /// Initialize secure storage
  void initialize() {
    _secureStorage = const FlutterSecureStorage(
      aOptions: AndroidOptions(
        keyCipherAlgorithm:
            KeyCipherAlgorithm.RSA_ECB_OAEPwithSHA_256andMGF1Padding,
        storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
        resetOnError: true,
      ),
      iOptions: IOSOptions(
        accessibility: KeychainAccessibility.first_this_device_this_app_only,
      ),
    );
    AppLogger.info('Storage service initialized');
  }

  /// Ensure storage is initialized
  FlutterSecureStorage get secureStorage {
    if (_secureStorage == null) {
      initialize();
    }
    return _secureStorage;
  }

  // Token management

  /// Save JWT token securely
  Future<void> saveToken(String token) async {
    try {
      await secureStorage.write(key: AppConstants.tokenKey, value: token);
      AppLogger.debug('JWT token saved securely');
    } catch (e) {
      AppLogger.error('Failed to save token', error: e);
      throw StorageException(message: 'Failed to save authentication token');
    }
  }

  /// Retrieve JWT token
  Future<String?> getToken() async {
    try {
      final token = await secureStorage.read(key: AppConstants.tokenKey);
      if (token != null) {
        AppLogger.debug('JWT token retrieved');
      }
      return token;
    } catch (e) {
      AppLogger.error('Failed to retrieve token', error: e);
      return null;
    }
  }

  /// Check if token exists
  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  /// Delete JWT token
  Future<void> deleteToken() async {
    try {
      await secureStorage.delete(key: AppConstants.tokenKey);
      AppLogger.debug('JWT token deleted');
    } catch (e) {
      AppLogger.error('Failed to delete token', error: e);
      throw StorageException(message: 'Failed to delete authentication token');
    }
  }

  // Refresh token management

  /// Save refresh token securely
  Future<void> saveRefreshToken(String refreshToken) async {
    try {
      await secureStorage.write(
        key: '${AppConstants.tokenKey}_refresh',
        value: refreshToken,
      );
      AppLogger.debug('Refresh token saved securely');
    } catch (e) {
      AppLogger.error('Failed to save refresh token', error: e);
      throw StorageException(message: 'Failed to save refresh token');
    }
  }

  /// Retrieve refresh token
  Future<String?> getRefreshToken() async {
    try {
      final token = await secureStorage.read(
        key: '${AppConstants.tokenKey}_refresh',
      );
      return token;
    } catch (e) {
      AppLogger.error('Failed to retrieve refresh token', error: e);
      return null;
    }
  }

  /// Delete refresh token
  Future<void> deleteRefreshToken() async {
    try {
      await secureStorage.delete(key: '${AppConstants.tokenKey}_refresh');
      AppLogger.debug('Refresh token deleted');
    } catch (e) {
      AppLogger.error('Failed to delete refresh token', error: e);
    }
  }

  // User data caching

  /// Save user data as JSON string
  Future<void> saveUserData(String userJson) async {
    try {
      await secureStorage.write(key: 'user_data', value: userJson);
      AppLogger.debug('User data saved');
    } catch (e) {
      AppLogger.error('Failed to save user data', error: e);
      throw StorageException(message: 'Failed to save user data');
    }
  }

  /// Retrieve user data
  Future<String?> getUserData() async {
    try {
      return await secureStorage.read(key: 'user_data');
    } catch (e) {
      AppLogger.error('Failed to retrieve user data', error: e);
      return null;
    }
  }

  /// Delete user data
  Future<void> deleteUserData() async {
    try {
      await secureStorage.delete(key: 'user_data');
      AppLogger.debug('User data deleted');
    } catch (e) {
      AppLogger.error('Failed to delete user data', error: e);
    }
  }

  // Generic key-value storage

  /// Save generic data
  Future<void> save(String key, String value) async {
    try {
      await secureStorage.write(key: key, value: value);
      AppLogger.debug('Data saved for key: $key');
    } catch (e) {
      AppLogger.error('Failed to save data for key: $key', error: e);
      throw StorageException(message: 'Failed to save data');
    }
  }

  /// Retrieve generic data
  Future<String?> get(String key) async {
    try {
      return await secureStorage.read(key: key);
    } catch (e) {
      AppLogger.error('Failed to retrieve data for key: $key', error: e);
      return null;
    }
  }

  /// Delete generic data
  Future<void> delete(String key) async {
    try {
      await secureStorage.delete(key: key);
      AppLogger.debug('Data deleted for key: $key');
    } catch (e) {
      AppLogger.error('Failed to delete data for key: $key', error: e);
    }
  }

  /// Check if key exists
  Future<bool> contains(String key) async {
    try {
      final value = await get(key);
      return value != null;
    } catch (e) {
      return false;
    }
  }

  // Bulk operations

  /// Clear all stored data
  Future<void> clearAll() async {
    try {
      await secureStorage.deleteAll();
      AppLogger.info('All secure storage data cleared');
    } catch (e) {
      AppLogger.error('Failed to clear storage', error: e);
      throw StorageException(message: 'Failed to clear storage');
    }
  }

  /// Get all stored keys
  Future<Map<String, String>> getAll() async {
    try {
      return await secureStorage.readAll();
    } catch (e) {
      AppLogger.error('Failed to read all data', error: e);
      return {};
    }
  }
}
