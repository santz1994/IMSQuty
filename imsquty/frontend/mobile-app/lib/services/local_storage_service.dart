// lib/services/local_storage_service.dart
// Hive-based local database for offline support
// Task 7 - Offline Support | 220+ LOC

import 'package:hive_flutter/hive_flutter.dart';
import 'package:imsquty_mobile/models/hive_models.dart';
import 'package:imsquty_mobile/utils/app_logger.dart';

class LocalStorageService {
  static const String assetsBoxName = 'assets';
  static const String ticketsBoxName = 'tickets';
  static const String syncMetadataBoxName = 'sync_metadata';
  static const String cacheMetadataBoxName = 'cache_metadata';
  static const String offlineQueueBoxName = 'offline_queue';

  late Box<HiveAsset> _assetsBox;
  late Box<HiveTicket> _ticketsBox;
  late Box<HiveSyncMetadata> _syncMetadataBox;
  late Box<HiveCacheMetadata> _cacheMetadataBox;
  late Box<HiveOfflineQueueItem> _offlineQueueBox;

  bool _initialized = false;

  /// Initialize Hive and all boxes
  Future<void> initialize() async {
    try {
      if (_initialized) return;

      await Hive.initFlutter();

      // Register adapters
      Hive.registerAdapter(HiveAssetAdapter());
      Hive.registerAdapter(HiveTicketAdapter());
      Hive.registerAdapter(HiveSyncMetadataAdapter());
      Hive.registerAdapter(HiveCacheMetadataAdapter());
      Hive.registerAdapter(HiveOfflineQueueItemAdapter());

      // Open boxes
      _assetsBox = await Hive.openBox<HiveAsset>(assetsBoxName);
      _ticketsBox = await Hive.openBox<HiveTicket>(ticketsBoxName);
      _syncMetadataBox = await Hive.openBox<HiveSyncMetadata>(syncMetadataBoxName);
      _cacheMetadataBox = await Hive.openBox<HiveCacheMetadata>(cacheMetadataBoxName);
      _offlineQueueBox = await Hive.openBox<HiveOfflineQueueItem>(offlineQueueBoxName);

      _initialized = true;
      AppLogger.info('Local storage initialized successfully');
    } catch (e) {
      AppLogger.error('Failed to initialize local storage', error: e);
      rethrow;
    }
  }

  // ========================================================================
  // ASSET OPERATIONS
  // ========================================================================

  /// Save or update asset in local cache
  Future<void> saveAsset(HiveAsset asset) async {
    try {
      await _assetsBox.put(asset.id, asset);
      AppLogger.info('Asset cached: ${asset.id}');
    } catch (e) {
      AppLogger.error('Failed to save asset', error: e);
      rethrow;
    }
  }

  /// Save multiple assets
  Future<void> saveAssets(List<HiveAsset> assets) async {
    try {
      for (var asset in assets) {
        await _assetsBox.put(asset.id, asset);
      }
      AppLogger.info('Cached ${assets.length} assets');
    } catch (e) {
      AppLogger.error('Failed to save assets', error: e);
      rethrow;
    }
  }

  /// Get asset by ID
  HiveAsset? getAsset(int id) {
    try {
      return _assetsBox.get(id);
    } catch (e) {
      AppLogger.error('Failed to get asset', error: e);
      return null;
    }
  }

  /// Get all cached assets
  List<HiveAsset> getAllAssets() {
    try {
      return _assetsBox.values.toList();
    } catch (e) {
      AppLogger.error('Failed to get all assets', error: e);
      return [];
    }
  }

  /// Delete asset
  Future<void> deleteAsset(int id) async {
    try {
      await _assetsBox.delete(id);
      AppLogger.info('Asset deleted from cache: $id');
    } catch (e) {
      AppLogger.error('Failed to delete asset', error: e);
      rethrow;
    }
  }

  /// Clear all assets
  Future<void> clearAssets() async {
    try {
      await _assetsBox.clear();
      AppLogger.info('All assets cleared from cache');
    } catch (e) {
      AppLogger.error('Failed to clear assets', error: e);
      rethrow;
    }
  }

  // ========================================================================
  // TICKET OPERATIONS
  // ========================================================================

  /// Save or update ticket in local cache
  Future<void> saveTicket(HiveTicket ticket) async {
    try {
      await _ticketsBox.put(ticket.id, ticket);
      AppLogger.info('Ticket cached: ${ticket.id}');
    } catch (e) {
      AppLogger.error('Failed to save ticket', error: e);
      rethrow;
    }
  }

  /// Save multiple tickets
  Future<void> saveTickets(List<HiveTicket> tickets) async {
    try {
      for (var ticket in tickets) {
        await _ticketsBox.put(ticket.id, ticket);
      }
      AppLogger.info('Cached ${tickets.length} tickets');
    } catch (e) {
      AppLogger.error('Failed to save tickets', error: e);
      rethrow;
    }
  }

  /// Get ticket by ID
  HiveTicket? getTicket(int id) {
    try {
      return _ticketsBox.get(id);
    } catch (e) {
      AppLogger.error('Failed to get ticket', error: e);
      return null;
    }
  }

  /// Get all cached tickets
  List<HiveTicket> getAllTickets() {
    try {
      return _ticketsBox.values.toList();
    } catch (e) {
      AppLogger.error('Failed to get all tickets', error: e);
      return [];
    }
  }

  /// Delete ticket
  Future<void> deleteTicket(int id) async {
    try {
      await _ticketsBox.delete(id);
      AppLogger.info('Ticket deleted from cache: $id');
    } catch (e) {
      AppLogger.error('Failed to delete ticket', error: e);
      rethrow;
    }
  }

  /// Clear all tickets
  Future<void> clearTickets() async {
    try {
      await _ticketsBox.clear();
      AppLogger.info('All tickets cleared from cache');
    } catch (e) {
      AppLogger.error('Failed to clear tickets', error: e);
      rethrow;
    }
  }

  // ========================================================================
  // SYNC METADATA OPERATIONS
  // ========================================================================

  /// Record sync metadata
  Future<void> recordSyncMetadata(HiveSyncMetadata metadata) async {
    try {
      final key = '${metadata.entityType}_${metadata.entityId}_${metadata.operation}';
      await _syncMetadataBox.put(key, metadata);
    } catch (e) {
      AppLogger.error('Failed to record sync metadata', error: e);
      rethrow;
    }
  }

  /// Get pending syncs
  List<HiveSyncMetadata> getPendingSyncs() {
    try {
      return _syncMetadataBox.values
          .where((m) => !m.synced)
          .toList();
    } catch (e) {
      AppLogger.error('Failed to get pending syncs', error: e);
      return [];
    }
  }

  /// Mark as synced
  Future<void> markAsSynced(HiveSyncMetadata metadata) async {
    try {
      metadata.synced = true;
      await metadata.save();
    } catch (e) {
      AppLogger.error('Failed to mark as synced', error: e);
      rethrow;
    }
  }

  // ========================================================================
  // CACHE METADATA OPERATIONS
  // ========================================================================

  /// Update cache metadata
  Future<void> updateCacheMetadata(HiveCacheMetadata metadata) async {
    try {
      await _cacheMetadataBox.put(metadata.key, metadata);
    } catch (e) {
      AppLogger.error('Failed to update cache metadata', error: e);
      rethrow;
    }
  }

  /// Get cache metadata
  HiveCacheMetadata? getCacheMetadata(String key) {
    try {
      return _cacheMetadataBox.get(key);
    } catch (e) {
      AppLogger.error('Failed to get cache metadata', error: e);
      return null;
    }
  }

  /// Is cache valid and not expired
  bool isCacheValid(String key) {
    final metadata = getCacheMetadata(key);
    return metadata != null && metadata.isValid && !metadata.isExpired;
  }

  // ========================================================================
  // OFFLINE QUEUE OPERATIONS
  // ========================================================================

  /// Add to offline queue
  Future<void> addToOfflineQueue(HiveOfflineQueueItem item) async {
    try {
      await _offlineQueueBox.put(item.id, item);
      AppLogger.info('Added to offline queue: ${item.endpoint}');
    } catch (e) {
      AppLogger.error('Failed to add to offline queue', error: e);
      rethrow;
    }
  }

  /// Get pending queue items
  List<HiveOfflineQueueItem> getPendingQueueItems() {
    try {
      return _offlineQueueBox.values.toList();
    } catch (e) {
      AppLogger.error('Failed to get pending queue items', error: e);
      return [];
    }
  }

  /// Remove from queue
  Future<void> removeFromQueue(String id) async {
    try {
      await _offlineQueueBox.delete(id);
      AppLogger.info('Removed from offline queue: $id');
    } catch (e) {
      AppLogger.error('Failed to remove from queue', error: e);
      rethrow;
    }
  }

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  /// Clear all cached data
  Future<void> clearAll() async {
    try {
      await Future.wait([
        _assetsBox.clear(),
        _ticketsBox.clear(),
        _syncMetadataBox.clear(),
        _cacheMetadataBox.clear(),
        _offlineQueueBox.clear(),
      ]);
      AppLogger.info('All local storage cleared');
    } catch (e) {
      AppLogger.error('Failed to clear all data', error: e);
      rethrow;
    }
  }

  /// Get storage statistics
  Map<String, int> getStats() {
    return {
      'assets': _assetsBox.length,
      'tickets': _ticketsBox.length,
      'syncMetadata': _syncMetadataBox.length,
      'cacheMetadata': _cacheMetadataBox.length,
      'offlineQueue': _offlineQueueBox.length,
    };
  }

  /// Close all boxes
  Future<void> close() async {
    try {
      await Hive.close();
      _initialized = false;
      AppLogger.info('Local storage closed');
    } catch (e) {
      AppLogger.error('Failed to close local storage', error: e);
      rethrow;
    }
  }
}

/// Singleton instance
final localStorageService = LocalStorageService();
