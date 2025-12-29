// lib/screens/notification_center_screen.dart
// Notification center to view all notifications
// Task 8 - Push Notifications | 220+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/models/notification_model.dart';
import 'package:imsquty_mobile/providers/notification_providers.dart';

class NotificationCenterScreen extends ConsumerStatefulWidget {
  const NotificationCenterScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<NotificationCenterScreen> createState() =>
      _NotificationCenterScreenState();
}

class _NotificationCenterScreenState
    extends ConsumerState<NotificationCenterScreen> {
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final notifications = ref.watch(notificationsProvider);
    final notificationsNotifier = ref.watch(notificationsProvider.notifier);
    final groupedNotifications = ref.watch(groupedNotificationsProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    final filteredNotifications = _getFilteredNotifications(
      notifications,
      _selectedFilter,
      groupedNotifications,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text('Notifications'),
        elevation: 0,
        actions: [
          if (unreadCount > 0)
            TextButton.icon(
              onPressed: () {
                notificationsNotifier.markAllAsRead();
              },
              icon: Icon(Icons.done_all),
              label: Text('Mark All Read'),
            ),
          if (notifications.isNotEmpty)
            PopupMenuButton(
              itemBuilder: (BuildContext context) => [
                PopupMenuItem(
                  child: Text('Clear All'),
                  onTap: () {
                    _showClearDialog(context, notificationsNotifier);
                  },
                ),
              ],
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('all', 'All', notifications.length),
                SizedBox(width: 8),
                _buildFilterChip(
                  'asset',
                  'Assets',
                  groupedNotifications['asset']?.length ?? 0,
                ),
                SizedBox(width: 8),
                _buildFilterChip(
                  'ticket',
                  'Tickets',
                  groupedNotifications['ticket']?.length ?? 0,
                ),
              ],
            ),
          ),

          // Notifications list
          Expanded(
            child: filteredNotifications.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'No notifications',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    itemCount: filteredNotifications.length,
                    itemBuilder: (context, index) {
                      final notification = filteredNotifications[index];
                      return _buildNotificationTile(
                        context,
                        notification,
                        notificationsNotifier,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label, int count) {
    final isSelected = _selectedFilter == value;

    return FilterChip(
      label: Text('$label ($count)'),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedFilter = selected ? value : 'all';
        });
      },
      backgroundColor: isSelected ? Theme.of(context).primaryColor.withOpacity(0.1)
          : Colors.grey.shade200,
      labelStyle: TextStyle(
        color: isSelected ? Theme.of(context).primaryColor : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildNotificationTile(
    BuildContext context,
    PushNotification notification,
    NotificationsNotifier notificationsNotifier,
  ) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      color: notification.read ? Colors.white : Colors.blue.shade50,
      child: ListTile(
        onTap: () {
          if (!notification.read) {
            notificationsNotifier.markAsRead(notification.id);
          }
          _handleNotificationTap(context, notification);
        },
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: _getNotificationColor(notification.data['type']),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Icon(
              _getNotificationIcon(notification.data['type']),
              color: Colors.white,
            ),
          ),
        ),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.read ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 4),
            Text(
              notification.body,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 4),
            Text(
              _formatTime(notification.timestamp),
              style: Theme.of(context).textTheme.caption,
            ),
          ],
        ),
        trailing: GestureDetector(
          onTap: () {
            notificationsNotifier.deleteNotification(notification.id);
          },
          child: Icon(Icons.close, size: 20, color: Colors.grey),
        ),
        isThreeLine: true,
      ),
    );
  }

  List<PushNotification> _getFilteredNotifications(
    List<PushNotification> notifications,
    String filter,
    Map<String, List<PushNotification>> grouped,
  ) {
    if (filter == 'all') {
      return notifications;
    }
    return grouped[filter] ?? [];
  }

  Color _getNotificationColor(String? type) {
    switch (type) {
      case 'asset':
        return Colors.blue;
      case 'ticket':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'asset':
        return Icons.inventory_2;
      case 'ticket':
        return Icons.assignment;
      default:
        return Icons.notifications;
    }
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours} hours ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${timestamp.month}/${timestamp.day}/${timestamp.year}';
    }
  }

  void _handleNotificationTap(BuildContext context, PushNotification notification) {
    final actionType = notification.data['action'];
    final entityId = notification.data['entityId'];
    final entityType = notification.data['entityType'];

    // Navigate to detail screen based on notification type
    if (entityType == 'asset') {
      // Navigator.of(context).pushNamed('/assets/$entityId');
    } else if (entityType == 'ticket') {
      // Navigator.of(context).pushNamed('/tickets/$entityId');
    }
  }

  void _showClearDialog(BuildContext context, NotificationsNotifier notifier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Clear All Notifications?'),
        content: Text('This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              notifier.clearAll();
              Navigator.pop(context);
            },
            child: Text('Clear'),
          ),
        ],
      ),
    );
  }
}
