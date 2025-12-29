// lib/widgets/notification_badge_widget.dart
// Notification badge widget for AppBar
// Task 8 - Push Notifications | 100+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/providers/notification_providers.dart';
import 'package:imsquty_mobile/screens/notification_center_screen.dart';

/// Notification badge - shows unread count
class NotificationBadge extends ConsumerWidget {
  final EdgeInsets padding;
  final double badgeSize;

  const NotificationBadge({
    Key? key,
    this.padding = const EdgeInsets.all(8),
    this.badgeSize = 20,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadCountProvider);

    return Padding(
      padding: padding,
      child: Stack(
        children: [
          IconButton(
            icon: Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) => NotificationCenterScreen(),
                ),
              );
            },
          ),
          if (unreadCount > 0)
            Positioned(
              right: 0,
              top: 0,
              child: Container(
                width: badgeSize,
                height: badgeSize,
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    unreadCount > 99 ? '99+' : '$unreadCount',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Notification dropdown menu
class NotificationDropdown extends ConsumerWidget {
  const NotificationDropdown({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recentNotifications = ref.watch(recentNotificationsProvider);
    final unreadCount = ref.watch(unreadCountProvider);
    final notificationsNotifier = ref.watch(notificationsProvider.notifier);

    return PopupMenuButton(
      position: PopupMenuPosition.under,
      itemBuilder: (BuildContext context) {
        if (recentNotifications.isEmpty) {
          return [
            PopupMenuItem(
              enabled: false,
              child: Text('No notifications'),
            ),
          ];
        }

        final items = <PopupMenuEntry>[
          PopupMenuItem(
            enabled: false,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Notifications ($unreadCount new)',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
          ),
          PopupMenuDivider(),
        ];

        for (var i = 0; i < recentNotifications.length && i < 5; i++) {
          final notification = recentNotifications[i];
          items.add(
            PopupMenuItem(
              child: GestureDetector(
                onTap: () {
                  notificationsNotifier.markAsRead(notification.id);
                  Navigator.pop(context);
                  // Handle navigation based on notification type
                },
                child: Container(
                  width: 300,
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: notification.read ? Colors.transparent : Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              notification.title,
                              style: TextStyle(
                                fontWeight: notification.read
                                    ? FontWeight.normal
                                    : FontWeight.bold,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            _formatTime(notification.timestamp),
                            style: Theme.of(context).textTheme.caption,
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        notification.body,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }

        if (recentNotifications.length > 5) {
          items.add(PopupMenuDivider());
          items.add(
            PopupMenuItem(
              child: Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => NotificationCenterScreen(),
                      ),
                    );
                  },
                  child: Text('View All Notifications'),
                ),
              ),
            ),
          );
        }

        return items;
      },
      child: NotificationBadge(),
    );
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d';
    } else {
      return '${timestamp.month}/${timestamp.day}';
    }
  }
}

/// Animated notification bell icon
class AnimatedNotificationBell extends ConsumerWidget {
  final double size;

  const AnimatedNotificationBell({Key? key, this.size = 24})
      : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadCountProvider);

    return AnimatedScale(
      scale: unreadCount > 0 ? 1.1 : 1.0,
      duration: Duration(milliseconds: 200),
      child: NotificationBadge(badgeSize: size * 0.8),
    );
  }
}
