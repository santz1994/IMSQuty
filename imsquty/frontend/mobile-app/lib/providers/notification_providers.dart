// lib/providers/notification_providers.dart
// Riverpod providers for push notifications
// Task 8 - Push Notifications | 180+ LOC

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/models/notification_model.dart';
import 'package:imsquty_mobile/services/firebase_messaging_service.dart';
import 'package:imsquty_mobile/utils/app_logger.dart';

// ========================================================================
// NOTIFICATION STREAM PROVIDER
// ========================================================================

/// Stream of incoming notifications
final notificationStreamProvider = StreamProvider<PushNotification>((ref) {
  return Stream.fromIterable([]).asBroadcastStream();
});

// ========================================================================
// NOTIFICATIONS LIST PROVIDER
// ========================================================================

/// Notifications list state notifier
class NotificationsNotifier extends StateNotifier<List<PushNotification>> {
  NotificationsNotifier() : super([]) {
    _setupListeners();
  }

  void _setupListeners() {
    firebaseMessagingService.addMessageListener((notification) {
      addNotification(notification);
    });
  }

  /// Add new notification
  void addNotification(PushNotification notification) {
    state = [notification, ...state];
    AppLogger.info('Notification added: ${notification.title}');
  }

  /// Mark notification as read
  void markAsRead(String notificationId) {
    state = state.map((n) {
      if (n.id == notificationId) {
        return n.copyWith(read: true);
      }
      return n;
    }).toList();
  }

  /// Mark all as read
  void markAllAsRead() {
    state = state.map((n) => n.copyWith(read: true)).toList();
  }

  /// Delete notification
  void deleteNotification(String notificationId) {
    state = state.where((n) => n.id != notificationId).toList();
  }

  /// Clear all
  void clearAll() {
    state = [];
  }

  /// Get unread count
  int getUnreadCount() {
    return state.where((n) => !n.read).length;
  }

  /// Filter by type
  List<PushNotification> filterByType(String type) {
    return state
        .where((n) => n.data['type'] == type)
        .toList();
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, List<PushNotification>>((ref) {
  return NotificationsNotifier();
});

// ========================================================================
// UNREAD COUNT PROVIDER
// ========================================================================

class UnreadCountNotifier extends StateNotifier<int> {
  final NotificationsNotifier _notificationsNotifier;

  UnreadCountNotifier(this._notificationsNotifier) : super(0) {
    state = _notificationsNotifier.getUnreadCount();
    _notificationsNotifier.addListener((newState) {
      state = _notificationsNotifier.getUnreadCount();
    });
  }
}

final unreadCountProvider = StateNotifierProvider<UnreadCountNotifier, int>((ref) {
  final notifications = ref.watch(notificationsProvider.notifier);
  return UnreadCountNotifier(notifications);
});

// ========================================================================
// NOTIFICATION SUBSCRIPTION PROVIDER
// ========================================================================

/// Subscribe user to notifications
final subscribeToUserNotificationsProvider =
    FutureProvider.family<void, int>((ref, userId) async {
  await firebaseMessagingService.subscribeToUserNotifications(userId);
});

/// Subscribe to asset notifications
final subscribeToAssetNotificationsProvider =
    FutureProvider.family<void, int>((ref, assetId) async {
  await firebaseMessagingService.subscribeToAssetNotifications(assetId);
});

/// Subscribe to ticket notifications
final subscribeToTicketNotificationsProvider =
    FutureProvider.family<void, int>((ref, ticketId) async {
  await firebaseMessagingService.subscribeToTicketNotifications(ticketId);
});

// ========================================================================
// FCM TOKEN PROVIDER
// ========================================================================

final fcmTokenProvider = FutureProvider<String?>((ref) async {
  return await firebaseMessagingService.getToken();
});

// ========================================================================
// NOTIFICATION PERMISSION PROVIDER
// ========================================================================

final notificationPermissionProvider = FutureProvider<bool>((ref) async {
  return await firebaseMessagingService.hasPermission();
});

// ========================================================================
// FILTERED NOTIFICATIONS PROVIDERS
// ========================================================================

/// Filter notifications by type
final assetNotificationsProvider = Provider<List<PushNotification>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications
      .where((n) => n.data['type'] == 'asset')
      .toList();
});

final ticketNotificationsProvider = Provider<List<PushNotification>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  return notifications
      .where((n) => n.data['type'] == 'ticket')
      .toList();
});

/// Get notifications for specific asset
final assetNotificationsByIdProvider =
    Provider.family<List<PushNotification>, int>((ref, assetId) {
  final notifications = ref.watch(notificationsProvider);
  return notifications
      .where((n) =>
          n.data['type'] == 'asset' &&
          n.data['entityId'] == assetId)
      .toList();
});

/// Get notifications for specific ticket
final ticketNotificationsByIdProvider =
    Provider.family<List<PushNotification>, int>((ref, ticketId) {
  final notifications = ref.watch(notificationsProvider);
  return notifications
      .where((n) =>
          n.data['type'] == 'ticket' &&
          n.data['entityId'] == ticketId)
      .toList();
});

// ========================================================================
// RECENT NOTIFICATIONS PROVIDER
// ========================================================================

final recentNotificationsProvider = Provider<List<PushNotification>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  // Return last 10 notifications
  return notifications.take(10).toList();
});

// ========================================================================
// GROUPED NOTIFICATIONS PROVIDER
// ========================================================================

final groupedNotificationsProvider = Provider<
    Map<String, List<PushNotification>>>((ref) {
  final notifications = ref.watch(notificationsProvider);
  
  return Map.fromIterable(
    notifications.map((n) => n.data['type'] as String? ?? 'other').toSet(),
    key: (type) => type,
    value: (type) => notifications
        .where((n) => n.data['type'] == type)
        .toList(),
  );
});
