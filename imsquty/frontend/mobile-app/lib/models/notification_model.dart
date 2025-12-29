// lib/models/notification_model.dart
// Push notification model
// Task 8 - Push Notifications | 80+ LOC

import 'package:firebase_messaging/firebase_messaging.dart';

class PushNotification {
  final String id;
  final String title;
  final String body;
  final Map<String, dynamic> data;
  final DateTime timestamp;
  final String? imageUrl;
  final bool read;

  PushNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.data,
    required this.timestamp,
    this.imageUrl,
    this.read = false,
  });

  /// Create from Firebase RemoteMessage
  factory PushNotification.fromRemoteMessage(RemoteMessage message) {
    final notification = message.notification;
    final data = message.data;

    return PushNotification(
      id: message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: notification?.title ?? data['title'] ?? 'Notification',
      body: notification?.body ?? data['body'] ?? '',
      data: data,
      timestamp: DateTime.now(),
      imageUrl:
          notification?.android?.imageUrl ?? notification?.apple?.imageUrl,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'data': data,
      'timestamp': timestamp.toIso8601String(),
      'imageUrl': imageUrl,
      'read': read,
    };
  }

  /// Create from JSON
  factory PushNotification.fromJson(Map<String, dynamic> json) {
    return PushNotification(
      id: json['id'] as String,
      title: json['title'] as String,
      body: json['body'] as String,
      data: (json['data'] as Map?)?.cast<String, dynamic>() ?? {},
      timestamp: DateTime.parse(json['timestamp'] as String),
      imageUrl: json['imageUrl'] as String?,
      read: json['read'] as bool? ?? false,
    );
  }

  /// Copy with changes
  PushNotification copyWith({
    String? id,
    String? title,
    String? body,
    Map<String, dynamic>? data,
    DateTime? timestamp,
    String? imageUrl,
    bool? read,
  }) {
    return PushNotification(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      data: data ?? this.data,
      timestamp: timestamp ?? this.timestamp,
      imageUrl: imageUrl ?? this.imageUrl,
      read: read ?? this.read,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PushNotification &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          title == other.title &&
          body == other.body;

  @override
  int get hashCode => id.hashCode ^ title.hashCode ^ body.hashCode;

  @override
  String toString() => 'PushNotification(id: $id, title: $title, body: $body)';
}
