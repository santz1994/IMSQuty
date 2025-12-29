// lib/widgets/offline_indicator_widget.dart
// Display online/offline status and sync progress
// Task 7 - Offline Support | 150+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/providers/offline_providers.dart';

/// Offline indicator widget - shows in AppBar
class OfflineIndicator extends ConsumerWidget {
  final bool compact;

  const OfflineIndicator({Key? key, this.compact = false}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offlineState = ref.watch(offlineStateProvider);
    final isOnline = offlineState.isOnline;
    final isSyncing = offlineState.isSyncing;
    final pendingItems = offlineState.pendingItems;

    if (isOnline && !isSyncing && pendingItems == 0) {
      return SizedBox.shrink();
    }

    return compact
        ? _buildCompact(context, offlineState)
        : _buildFull(context, offlineState);
  }

  Widget _buildCompact(BuildContext context, OfflineState state) {
    if (state.isOnline && !state.isSyncing && state.pendingItems == 0) {
      return SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!state.isOnline)
            Tooltip(
              message: 'Offline Mode - ${state.pendingItems} pending items',
              child: Padding(
                padding: EdgeInsets.only(right: 4),
                child: Icon(Icons.cloud_off, size: 16, color: Colors.red),
              ),
            ),
          if (state.isSyncing)
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          if (state.hasPendingItems && state.isOnline && !state.isSyncing)
            Tooltip(
              message: '${state.pendingItems} items ready to sync',
              child: Padding(
                padding: EdgeInsets.only(left: 4),
                child: Icon(Icons.sync_alt, size: 16, color: Colors.orange),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildFull(BuildContext context, OfflineState state) {
    return Container(
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: !state.isOnline ? Colors.red.shade100 : Colors.orange.shade100,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                !state.isOnline ? Icons.cloud_off : Icons.sync_alt,
                color: !state.isOnline ? Colors.red : Colors.orange,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      !state.isOnline ? 'Offline Mode' : 'Syncing...',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    if (!state.isOnline)
                      Text(
                        '${state.pendingItems} items to sync when online',
                        style: Theme.of(context).textTheme.bodySmall,
                      )
                    else if (state.isSyncing)
                      Text(
                        '${state.syncProgress}/${state.syncTotal} synced',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                  ],
                ),
              ),
              if (state.isSyncing)
                SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          if (state.isSyncing && state.syncTotal > 0)
            Padding(
              padding: EdgeInsets.only(top: 8),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: state.syncPercentage / 100,
                  minHeight: 4,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Floating offline sync button
class OfflineSyncButton extends ConsumerWidget {
  const OfflineSyncButton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offlineState = ref.watch(offlineStateProvider);
    final syncState = ref.watch(syncStateProvider.notifier);

    if (offlineState.isOnline && !offlineState.hasPendingItems) {
      return SizedBox.shrink();
    }

    return FloatingActionButton.extended(
      onPressed: offlineState.isSyncing
          ? null
          : () => _sync(context, ref, syncState),
      icon: offlineState.isSyncing
          ? SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Icon(Icons.sync_alt),
      label: Text(
        offlineState.isSyncing
            ? 'Syncing ${offlineState.syncProgress}/${offlineState.syncTotal}'
            : 'Sync Now',
      ),
      backgroundColor: offlineState.isSyncing ? Colors.grey : Colors.blue,
    );
  }

  void _sync(BuildContext context, WidgetRef ref, SyncStateNotifier syncState) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Sync Data'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('What would you like to sync?'),
              SizedBox(height: 16),
              SizedBox(
                width: double.maxFinite,
                child: ElevatedButton(
                  onPressed: () {
                    syncState.syncAssets();
                    Navigator.pop(context);
                  },
                  child: Text('Sync Assets'),
                ),
              ),
              SizedBox(height: 8),
              SizedBox(
                width: double.maxFinite,
                child: ElevatedButton(
                  onPressed: () {
                    syncState.syncTickets();
                    Navigator.pop(context);
                  },
                  child: Text('Sync Tickets'),
                ),
              ),
              SizedBox(height: 8),
              SizedBox(
                width: double.maxFinite,
                child: ElevatedButton(
                  onPressed: () {
                    syncState.syncAll();
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                  child: Text('Sync All'),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Cancel'),
            ),
          ],
        );
      },
    );
  }
}

/// Inline offline message banner
class OfflineBanner extends ConsumerWidget {
  final bool showInOnlineMode;

  const OfflineBanner({Key? key, this.showInOnlineMode = false})
    : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offlineState = ref.watch(offlineStateProvider);

    if (offlineState.isOnline && !showInOnlineMode) {
      return SizedBox.shrink();
    }

    return Container(
      color: offlineState.isOnline ? Colors.amber : Colors.red,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(
            offlineState.isOnline ? Icons.cloud_queue : Icons.cloud_off,
            color: Colors.white,
          ),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              offlineState.isOnline
                  ? '${offlineState.pendingItems} items pending sync'
                  : 'You are offline - changes will sync when online',
              style: TextStyle(color: Colors.white),
            ),
          ),
          if (offlineState.isSyncing)
            SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}
