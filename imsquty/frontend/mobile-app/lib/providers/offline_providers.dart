// lib/providers/offline_providers.dart
// Riverpod providers for connectivity and sync
// Task 7 - Offline Support | 180+ LOC

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/services/api_service.dart';
import 'package:imsquty_mobile/services/connectivity_service.dart';
import 'package:imsquty_mobile/services/local_storage_service.dart';
import 'package:imsquty_mobile/services/sync_manager_service.dart';

// ========================================================================
// CONNECTIVITY PROVIDER
// ========================================================================

/// Provides connectivity state as a stream
final connectivityStateProvider = StreamProvider<bool>((ref) async* {
  final service = connectivityService;

  // Emit current state
  yield service.isOnline;

  // Create a future for connection status changes
  final completer = Future<bool>.delayed(Duration(seconds: 1));

  while (true) {
    await Future.delayed(Duration(seconds: 5));
    await service.checkConnectivity();
    yield service.isOnline;
  }
});

/// Simplified connectivity provider - is device online?
final isOnlineProvider = FutureProvider<bool>((ref) async {
  return connectivityService.isOnline;
});

/// Connectivity state as notifier for imperative updates
class ConnectivityNotifier extends StateNotifier<bool> {
  final ConnectivityService _service = connectivityService;

  ConnectivityNotifier() : super(true) {
    _service.addListener((isOnline) {
      state = isOnline;
    });
  }

  Future<void> checkNow() async {
    await _service.checkConnectivity();
  }
}

final connectivityNotifierProvider =
    StateNotifierProvider<ConnectivityNotifier, bool>((ref) {
      return ConnectivityNotifier();
    });

// ========================================================================
// SYNC MANAGER PROVIDER
// ========================================================================

/// Provides sync manager instance
final syncManagerProvider = Provider<SyncManagerService>((ref) {
  return SyncManagerService(
    apiService: apiService,
    storageService: localStorageService,
  );
});

/// Tracks sync progress
class SyncProgressNotifier extends StateNotifier<(int, int)> {
  final SyncManagerService _syncManager;

  SyncProgressNotifier(this._syncManager) : super((0, 0)) {
    _syncManager.addProgressListener((completed, total) {
      state = (completed, total);
    });
  }
}

final syncProgressProvider =
    StateNotifierProvider<SyncProgressNotifier, (int, int)>((ref) {
      final syncManager = ref.watch(syncManagerProvider);
      return SyncProgressNotifier(syncManager);
    });

/// Tracks sync state (isSyncing)
class SyncStateNotifier extends StateNotifier<bool> {
  final SyncManagerService _syncManager;

  SyncStateNotifier(this._syncManager) : super(false) {
    _syncManager.addCompleteListener((success, error) {
      state = false;
    });
  }

  Future<void> syncAll() async {
    state = true;
    await _syncManager.syncAll();
  }

  Future<void> syncAssets() async {
    state = true;
    await _syncManager.syncAssets();
    state = false;
  }

  Future<void> syncTickets() async {
    state = true;
    await _syncManager.syncTickets();
    state = false;
  }
}

final syncStateProvider = StateNotifierProvider<SyncStateNotifier, bool>((ref) {
  final syncManager = ref.watch(syncManagerProvider);
  return SyncStateNotifier(syncManager);
});

/// Pending queue items count
final pendingQueueCountProvider = FutureProvider<int>((ref) {
  final items = localStorageService.getPendingQueueItems();
  return items.length;
});

/// Sync statistics
final syncStatsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  final syncManager = ref.watch(syncManagerProvider);
  return Future.value(syncManager.getStats());
});

// ========================================================================
// LOCAL STORAGE PROVIDER
// ========================================================================

/// Provides local storage service
final localStorageProvider = Provider<LocalStorageService>((ref) {
  return localStorageService;
});

/// Storage statistics (assets, tickets, queue items count)
final storageStatsProvider = FutureProvider<Map<String, int>>((ref) {
  return Future.value(localStorageService.getStats());
});

// ========================================================================
// COMBINED OFFLINE STATE PROVIDER
// ========================================================================

/// Combines connectivity and sync state
class OfflineStateNotifier extends StateNotifier<OfflineState> {
  OfflineStateNotifier(this._connectivity, this._syncState)
    : super(OfflineState.initial()) {
    // Listen to connectivity changes
    _connectivity.addListener((bool isOnline) {
      state = state.copyWith(isOnline: isOnline);
    });
  }

  final ConnectivityService _connectivity;
  final SyncStateNotifier _syncState;

  void updateFromSync(int completed, int total) {
    state = state.copyWith(syncProgress: completed, syncTotal: total);
  }
}

class OfflineState {
  final bool isOnline;
  final bool isSyncing;
  final int syncProgress;
  final int syncTotal;
  final int pendingItems;

  OfflineState({
    required this.isOnline,
    required this.isSyncing,
    required this.syncProgress,
    required this.syncTotal,
    required this.pendingItems,
  });

  factory OfflineState.initial() {
    return OfflineState(
      isOnline: true,
      isSyncing: false,
      syncProgress: 0,
      syncTotal: 0,
      pendingItems: 0,
    );
  }

  OfflineState copyWith({
    bool? isOnline,
    bool? isSyncing,
    int? syncProgress,
    int? syncTotal,
    int? pendingItems,
  }) {
    return OfflineState(
      isOnline: isOnline ?? this.isOnline,
      isSyncing: isSyncing ?? this.isSyncing,
      syncProgress: syncProgress ?? this.syncProgress,
      syncTotal: syncTotal ?? this.syncTotal,
      pendingItems: pendingItems ?? this.pendingItems,
    );
  }

  double get syncPercentage =>
      syncTotal > 0 ? (syncProgress / syncTotal) * 100 : 0.0;

  bool get hasPendingItems => pendingItems > 0;
}

final offlineStateProvider =
    StateNotifierProvider<OfflineStateNotifier, OfflineState>((ref) {
      final connectivity = connectivityService;
      final syncState = ref.watch(syncStateProvider.notifier);
      return OfflineStateNotifier(connectivity, syncState);
    });
