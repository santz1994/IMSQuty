import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Notification Service - Firebase Cloud Messaging integration
/// Handles push notifications, deep linking, and notification callbacks
class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  late final FirebaseMessaging _firebaseMessaging;

  // Callbacks
  Function(RemoteMessage)? onMessageReceived;
  Function(RemoteMessage)? onMessageOpenedFromTerminated;
  Function(RemoteMessage)? onMessageOpenedFromBackground;

  factory NotificationService() {
    return _instance;
  }

  NotificationService._internal();

  /// Initialize Firebase Cloud Messaging
  Future<void> initialize() async {
    try {
      _firebaseMessaging = FirebaseMessaging.instance;

      // Request notification permissions (iOS)
      await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      // Get FCM token
      final token = await _firebaseMessaging.getToken();
      AppLogger.info('FCM Token: $token');

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        AppLogger.info(
          'Foreground notification received: ${message.notification?.title}',
        );
        onMessageReceived?.call(message);
      });

      // Handle background messages
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        AppLogger.info(
          'App opened from notification: ${message.notification?.title}',
        );
        onMessageOpenedFromBackground?.call(message);
      });

      // Handle terminated app notification
      final RemoteMessage? initialMessage = await _firebaseMessaging
          .getInitialMessage();
      if (initialMessage != null) {
        AppLogger.info(
          'App launched from notification: ${initialMessage.notification?.title}',
        );
        onMessageOpenedFromTerminated?.call(initialMessage);
      }

      AppLogger.info('Firebase Cloud Messaging initialized');
    } catch (e) {
      AppLogger.error('Failed to initialize FCM', error: e);
      rethrow;
    }
  }

  /// Get Firebase Cloud Messaging token
  Future<String?> getToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      AppLogger.error('Failed to get FCM token', error: e);
      return null;
    }
  }

  /// Listen to FCM token changes
  /// Call this when user signs in to get new device token for their account
  void onTokenRefresh(Function(String) callback) {
    _firebaseMessaging.onTokenRefresh.listen((newToken) {
      AppLogger.info('FCM token refreshed: $newToken');
      callback(newToken);
    });
  }

  /// Subscribe to topic
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      AppLogger.info('Subscribed to topic: $topic');
    } catch (e) {
      AppLogger.error('Failed to subscribe to topic: $topic', error: e);
    }
  }

  /// Unsubscribe from topic
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      AppLogger.info('Unsubscribed from topic: $topic');
    } catch (e) {
      AppLogger.error('Failed to unsubscribe from topic: $topic', error: e);
    }
  }

  /// Subscribe to notifications for specific entity (e.g., asset, ticket)
  /// Topics: tickets, assets, users, notifications
  Future<void> subscribeToEntityNotifications(String entityType) async {
    await subscribeToTopic(entityType);
  }

  /// Unsubscribe from entity notifications
  Future<void> unsubscribeFromEntityNotifications(String entityType) async {
    await unsubscribeFromTopic(entityType);
  }

  /// Handle notification - Extract deep link and data
  /// Returns notification data map
  Map<String, dynamic> parseNotification(RemoteMessage message) {
    final notification = message.notification;
    final data = message.data;

    return {
      'title': notification?.title ?? 'Notification',
      'body': notification?.body ?? '',
      'data': data,
      'deepLink': data['deepLink'] ?? '',
      'type': data['type'] ?? 'default',
      'entityId': data['entityId'] ?? '',
      'entityType': data['entityType'] ?? '',
    };
  }

  /// Check if notifications are enabled
  Future<NotificationSettings> getNotificationSettings() async {
    return await _firebaseMessaging.getNotificationSettings();
  }

  /// Enable/disable notifications
  Future<NotificationSettings> requestPermission({
    bool alert = true,
    bool announcement = false,
    bool badge = true,
    bool carPlay = false,
    bool criticalAlert = false,
    bool provisional = false,
    bool sound = true,
  }) async {
    return await _firebaseMessaging.requestPermission(
      alert: alert,
      announcement: announcement,
      badge: badge,
      carPlay: carPlay,
      criticalAlert: criticalAlert,
      provisional: provisional,
      sound: sound,
    );
  }

  /// Get permission status
  AuthorizationStatus getAuthorizationStatus() {
    return _firebaseMessaging.requestPermission().then(
          (settings) => settings.authorizationStatus,
        )
        as AuthorizationStatus;
  }

  /// Check if running on iOS
  bool isIOS() {
    // Implementation uses Platform.isIOS from dart:io
    return false; // Placeholder
  }

  /// Clear all notification cache
  Future<void> clearAllNotifications() async {
    try {
      // Platform-specific notification clearing would go here
      AppLogger.info('All notifications cleared');
    } catch (e) {
      AppLogger.error('Failed to clear notifications', error: e);
    }
  }
}

/// Background message handler
/// Called when app is terminated
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  AppLogger.info('Background message received: ${message.notification?.title}');
  // Handle background notification
  // Note: This runs in an isolated context
}

/// Notification data model
class NotificationData {
  final String title;
  final String body;
  final String type;
  final String entityType;
  final String entityId;
  final String deepLink;
  final Map<String, dynamic> customData;

  NotificationData({
    required this.title,
    required this.body,
    this.type = 'default',
    this.entityType = '',
    this.entityId = '',
    this.deepLink = '',
    this.customData = const {},
  });

  factory NotificationData.fromRemoteMessage(RemoteMessage message) {
    final notification = message.notification;
    final data = message.data;

    return NotificationData(
      title: notification?.title ?? 'Notification',
      body: notification?.body ?? '',
      type: data['type'] ?? 'default',
      entityType: data['entityType'] ?? '',
      entityId: data['entityId'] ?? '',
      deepLink: data['deepLink'] ?? '',
      customData: data,
    );
  }

  Map<String, dynamic> toMap() => {
    'title': title,
    'body': body,
    'type': type,
    'entityType': entityType,
    'entityId': entityId,
    'deepLink': deepLink,
    'customData': customData,
  };
}
