// lib/services/connectivity_service.dart
// Monitor internet connectivity and trigger sync
// Task 7 - Offline Support | 120+ LOC

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:imsquty_mobile/utils/app_logger.dart';

typedef ConnectionStatusCallback = void Function(bool isOnline);

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final List<ConnectionStatusCallback> _listeners = [];

  bool _isOnline = true;
  bool _initialized = false;

  bool get isOnline => _isOnline;

  /// Initialize connectivity monitoring
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Check initial connection
      final result = await _connectivity.checkConnectivity();
      _updateConnectionStatus(result);

      // Listen to connectivity changes
      _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);

      _initialized = true;
      AppLogger.info('Connectivity service initialized');
    } catch (e) {
      AppLogger.error('Failed to initialize connectivity service', error: e);
      rethrow;
    }
  }

  /// Update connection status
  void _updateConnectionStatus(ConnectivityResult result) {
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;

    if (wasOnline != _isOnline) {
      AppLogger.info('Connection changed: $_isOnline');
      _notifyListeners();
    }
  }

  /// Add connection status listener
  void addListener(ConnectionStatusCallback callback) {
    _listeners.add(callback);
  }

  /// Remove connection status listener
  void removeListener(ConnectionStatusCallback callback) {
    _listeners.remove(callback);
  }

  /// Notify all listeners
  void _notifyListeners() {
    for (var listener in _listeners) {
      listener(_isOnline);
    }
  }

  /// Manual connectivity check (useful for periodic verification)
  Future<void> checkConnectivity() async {
    try {
      final result = await _connectivity.checkConnectivity();
      _updateConnectionStatus(result);
    } catch (e) {
      AppLogger.error('Failed to check connectivity', error: e);
    }
  }
}

/// Singleton instance
final connectivityService = ConnectivityService();
