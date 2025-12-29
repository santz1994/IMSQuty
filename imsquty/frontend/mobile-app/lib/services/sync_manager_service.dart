// lib/services/sync_manager_service.dart
// Process offline queue and sync data when online
// Task 7 - Offline Support | 280+ LOC

import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:imsquty_mobile/models/hive_models.dart';
import 'package:imsquty_mobile/services/api_service.dart';
import 'package:imsquty_mobile/services/local_storage_service.dart';
import 'package:imsquty_mobile/utils/app_logger.dart';

typedef SyncProgressCallback = void Function(int completed, int total);
typedef SyncCompleteCallback = void Function(bool success, String? error);

class SyncManagerService {
  final ApiService apiService;
  final LocalStorageService storageService;

  bool _isSyncing = false;
  final List<SyncProgressCallback> _progressListeners = [];
  final List<SyncCompleteCallback> _completeListeners = [];

  bool get isSyncing => _isSyncing;

  SyncManagerService({required this.apiService, required this.storageService});

  /// Sync all pending operations
  Future<void> syncAll() async {
    if (_isSyncing) {
      AppLogger.warn('Sync already in progress');
      return;
    }

    _isSyncing = true;
    try {
      // Get all pending queue items
      final queueItems = storageService.getPendingQueueItems();

      if (queueItems.isEmpty) {
        AppLogger.info('No items to sync');
        _notifyComplete(true, null);
        return;
      }

      AppLogger.info('Starting sync: ${queueItems.length} items');
      int completed = 0;

      // Process each item
      for (var item in queueItems) {
        try {
          await _processQueueItem(item);
          completed++;
          _notifyProgress(completed, queueItems.length);
        } catch (e) {
          AppLogger.error(
            'Failed to process queue item: ${item.endpoint}',
            error: e,
          );

          // Update retry count
          item.retryCount++;
          item.lastRetryAt = DateTime.now();

          if (item.shouldRetry) {
            // Save updated item for retry
            await storageService.addToOfflineQueue(item);
          } else {
            // Max retries reached - remove from queue
            await storageService.removeFromQueue(item.id);
            AppLogger.error('Max retries reached for: ${item.endpoint}');
          }
        }
      }

      AppLogger.info('Sync completed: $completed/${queueItems.length} items');
      _notifyComplete(true, null);
    } catch (e) {
      AppLogger.error('Sync failed', error: e);
      _notifyComplete(false, e.toString());
    } finally {
      _isSyncing = false;
    }
  }

  /// Process individual queue item
  Future<void> _processQueueItem(HiveOfflineQueueItem item) async {
    try {
      late Response response;

      // Parse payload
      final Map<String, dynamic> payload = json.decode(item.payload);

      // Execute request based on method
      switch (item.method.toUpperCase()) {
        case 'GET':
          response = await apiService.get(item.endpoint);
          break;

        case 'POST':
          response = await apiService.post(item.endpoint, data: payload);
          break;

        case 'PUT':
          response = await apiService.put(item.endpoint, data: payload);
          break;

        case 'DELETE':
          response = await apiService.delete(item.endpoint);
          break;

        default:
          throw Exception('Unknown HTTP method: ${item.method}');
      }

      // Handle response
      if (response.statusCode! >= 200 && response.statusCode! < 300) {
        // Success - remove from queue
        await storageService.removeFromQueue(item.id);

        // Update local cache if asset/ticket
        await _updateLocalCache(item, response);

        AppLogger.info('Synced: ${item.endpoint}');
      } else {
        throw Exception(
          'HTTP ${response.statusCode}: ${response.statusMessage}',
        );
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Update local cache after successful sync
  Future<void> _updateLocalCache(
    HiveOfflineQueueItem item,
    Response response,
  ) async {
    try {
      final data = response.data;

      // Update asset cache
      if (item.endpoint.contains('/assets')) {
        if (data is Map && data.containsKey('id')) {
          final asset = HiveAsset(
            id: data['id'],
            name: data['name'],
            model: data['model'],
            serialNumber: data['serialNumber'],
            status: data['status'],
            type: data['type'],
            category: data['category'],
            manufacturer: data['manufacturer'],
            location: data['location'],
            assignedTo: data['assignedTo'],
            department: data['department'],
            purchasePrice: data['purchasePrice'],
            purchaseDate: data['purchaseDate'],
            warrantyType: data['warrantyType'],
            warrantyExpiry: data['warrantyExpiry'],
            notes: data['notes'],
            createdAt: data['createdAt'],
            updatedAt: data['updatedAt'],
            syncedAt: DateTime.now(),
          );
          await storageService.saveAsset(asset);
        }
      }

      // Update ticket cache
      if (item.endpoint.contains('/tickets')) {
        if (data is Map && data.containsKey('id')) {
          final ticket = HiveTicket(
            id: data['id'],
            title: data['title'],
            description: data['description'],
            category: data['category'],
            priority: data['priority'],
            status: data['status'],
            assignedTo: data['assignedTo'],
            assetId: data['assetId'],
            dueDate: data['dueDate'],
            notes: data['notes'],
            createdAt: data['createdAt'],
            updatedAt: data['updatedAt'],
            syncedAt: DateTime.now(),
          );
          await storageService.saveTicket(ticket);
        }
      }
    } catch (e) {
      AppLogger.warn('Failed to update local cache', error: e);
      // Don't rethrow - cache update is not critical for sync success
    }
  }

  /// Sync assets only
  Future<void> syncAssets() async {
    AppLogger.info('Syncing assets...');
    try {
      final items = storageService
          .getPendingQueueItems()
          .where((item) => item.endpoint.contains('/assets'))
          .toList();

      int completed = 0;
      for (var item in items) {
        try {
          await _processQueueItem(item);
          completed++;
        } catch (e) {
          AppLogger.error('Failed to sync asset', error: e);
        }
      }
      AppLogger.info('Assets sync completed: $completed items');
    } catch (e) {
      AppLogger.error('Assets sync failed', error: e);
    }
  }

  /// Sync tickets only
  Future<void> syncTickets() async {
    AppLogger.info('Syncing tickets...');
    try {
      final items = storageService
          .getPendingQueueItems()
          .where((item) => item.endpoint.contains('/tickets'))
          .toList();

      int completed = 0;
      for (var item in items) {
        try {
          await _processQueueItem(item);
          completed++;
        } catch (e) {
          AppLogger.error('Failed to sync ticket', error: e);
        }
      }
      AppLogger.info('Tickets sync completed: $completed items');
    } catch (e) {
      AppLogger.error('Tickets sync failed', error: e);
    }
  }

  /// Add progress listener
  void addProgressListener(SyncProgressCallback callback) {
    _progressListeners.add(callback);
  }

  /// Remove progress listener
  void removeProgressListener(SyncProgressCallback callback) {
    _progressListeners.remove(callback);
  }

  /// Notify progress
  void _notifyProgress(int completed, int total) {
    for (var listener in _progressListeners) {
      listener(completed, total);
    }
  }

  /// Add completion listener
  void addCompleteListener(SyncCompleteCallback callback) {
    _completeListeners.add(callback);
  }

  /// Remove completion listener
  void removeCompleteListener(SyncCompleteCallback callback) {
    _completeListeners.remove(callback);
  }

  /// Notify completion
  void _notifyComplete(bool success, String? error) {
    for (var listener in _completeListeners) {
      listener(success, error);
    }
  }

  /// Get sync statistics
  Map<String, dynamic> getStats() {
    return {
      'isSyncing': _isSyncing,
      'pendingItems': storageService.getPendingQueueItems().length,
    };
  }
}
