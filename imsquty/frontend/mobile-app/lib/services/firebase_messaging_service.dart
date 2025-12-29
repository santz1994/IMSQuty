// lib/services/firebase_messaging_service.dart
// Firebase Cloud Messaging for push notifications
// Task 8 - Push Notifications | 200+ LOC

import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:imsquty_mobile/models/notification_model.dart';
import 'package:imsquty_mobile/utils/app_logger.dart';

typedef MessageCallback = void Function(PushNotification);

class FirebaseMessagingService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  
  final List<MessageCallback> _messageListeners = [];
  final List<MessageCallback> _tokenListeners = [];

  bool _initialized = false;

  /// Initialize Firebase Cloud Messaging
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Request user permissions
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: true,
        badge: true,
        carryforward: true,
        criticalAlert: true,
        provisional: false,
        sound: true,
      );

      AppLogger.info('FCM permission status: ${settings.authorizationStatus}');

      // Get initial token
      String? token = await _firebaseMessaging.getToken();
      AppLogger.info('FCM Token: $token');
      _notifyTokenListeners(PushNotification(
        id: 'token',
        title: 'FCM Token Updated',
        body: token,
        data: {'token': token},
        timestamp: DateTime.now(),
      ));
    
      // Handle token refresh
      _firebaseMessaging.onTokenRefresh.listen((newToken) {
        AppLogger.info('FCM Token Refreshed: $newToken');
        _notifyTokenListeners(PushNotification(
          id: 'token_refresh',
          title: 'FCM Token Refreshed',
          body: newToken,
          data: {'token': newToken},
          timestamp: DateTime.now(),
        ));
      });

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background message
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification tap
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      _initialized = true;
      AppLogger.info('Firebase Cloud Messaging initialized');
    } catch (e) {
      AppLogger.error('Failed to initialize FCM', error: e);
      rethrow;
    }
  }

  /// Handle foreground message
  void _handleForegroundMessage(RemoteMessage message) {
    try {
      final notification = PushNotification.fromRemoteMessage(message);
      AppLogger.info('Received foreground message: ${notification.title}');
      _notifyMessageListeners(notification);
    } catch (e) {
      AppLogger.error('Failed to handle foreground message', error: e);
    }
  }

  /// Handle background message (top-level function)
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    try {
      final notification = PushNotification.fromRemoteMessage(message);
      AppLogger.info('Received background message: ${notification.title}');
      // Handle background logic here (store, update UI state, etc.)
    } catch (e) {
      AppLogger.error('Failed to handle background message', error: e);
    }
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    try {
      final notification = PushNotification.fromRemoteMessage(message);
      AppLogger.info('Notification tapped: ${notification.title}');
      // Navigate based on message data
      _handleNotificationNavigation(notification);
    } catch (e) {
      AppLogger.error('Failed to handle notification tap', error: e);
    }
  }

  /// Navigate based on notification data
  void _handleNotificationNavigation(PushNotification notification) {
    final actionType = notification.data['action'];
    final entityId = notification.data['entityId'];
    final entityType = notification.data['entityType'];

    // This will be handled by Riverpod provider or main navigation
    AppLogger.info('Navigate to: $actionType, Entity: $entityType/$entityId');
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      AppLogger.info('Subscribed to topic: $topic');
    } catch (e) {
      AppLogger.error('Failed to subscribe to topic: $topic', error: e);
      rethrow;
    }
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      AppLogger.info('Unsubscribed from topic: $topic');
    } catch (e) {
      AppLogger.error('Failed to unsubscribe from topic: $topic', error: e);
      rethrow;
    }
  }

  /// Subscribe to user notifications
  Future<void> subscribeToUserNotifications(int userId) async {
    await subscribeToTopic('user_$userId');
    await subscribeToTopic('notifications');
  }

  /// Unsubscribe from user notifications
  Future<void> unsubscribeFromUserNotifications(int userId) async {
    await unsubscribeFromTopic('user_$userId');
  }

  /// Subscribe to asset-related notifications
  Future<void> subscribeToAssetNotifications(int assetId) async {
    await subscribeToTopic('asset_$assetId');
  }

  /// Subscribe to ticket-related notifications
  Future<void> subscribeToTicketNotifications(int ticketId) async {
    await subscribeToTopic('ticket_$ticketId');
  }

  /// Add message listener
  void addMessageListener(MessageCallback callback) {
    _messageListeners.add(callback);
  }

  /// Remove message listener
  void removeMessageListener(MessageCallback callback) {
    _messageListeners.remove(callback);
  }

  /// Notify message listeners
  void _notifyMessageListeners(PushNotification notification) {
    for (var listener in _messageListeners) {
      listener(notification);
    }
  }

  /// Add token listener
  void addTokenListener(MessageCallback callback) {
    _tokenListeners.add(callback);
  }

  /// Remove token listener
  void removeTokenListener(MessageCallback callback) {
    _tokenListeners.remove(callback);
  }

  /// Notify token listeners
  void _notifyTokenListeners(PushNotification notification) {
    for (var listener in _tokenListeners) {
      listener(notification);
    }
  }

  /// Get current FCM token
  Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  /// Check notification permission
  Future<bool> hasPermission() async {
    NotificationSettings settings = await _firebaseMessaging.getNotificationSettings();
    return settings.authorizationStatus == AuthorizationStatus.authorized;
  }
}

/// Singleton instance
final firebaseMessagingService = FirebaseMessagingService();

/// Top-level function for background message handling
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) {
  return FirebaseMessagingService._handleBackgroundMessage(message);
}
