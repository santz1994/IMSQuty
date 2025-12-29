// lib/models/hive_models.dart
// Hive models for offline caching
// Task 7 - Offline Support | 150+ LOC

import 'package:hive/hive.dart';

part 'hive_models.g.dart';

// ============================================================================
// ASSET HIVE MODEL
// ============================================================================

@HiveType(typeId: 0)
class HiveAsset extends HiveObject {
  @HiveField(0)
  int id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String? model;

  @HiveField(3)
  String? serialNumber;

  @HiveField(4)
  String? status;

  @HiveField(5)
  String? type;

  @HiveField(6)
  String? category;

  @HiveField(7)
  String? manufacturer;

  @HiveField(8)
  String? location;

  @HiveField(9)
  String? assignedTo;

  @HiveField(10)
  String? department;

  @HiveField(11)
  double? purchasePrice;

  @HiveField(12)
  String? purchaseDate;

  @HiveField(13)
  String? warrantyType;

  @HiveField(14)
  String? warrantyExpiry;

  @HiveField(15)
  String? notes;

  @HiveField(16)
  DateTime? createdAt;

  @HiveField(17)
  DateTime? updatedAt;

  @HiveField(18)
  DateTime? syncedAt;

  HiveAsset({
    required this.id,
    required this.name,
    this.model,
    this.serialNumber,
    this.status,
    this.type,
    this.category,
    this.manufacturer,
    this.location,
    this.assignedTo,
    this.department,
    this.purchasePrice,
    this.purchaseDate,
    this.warrantyType,
    this.warrantyExpiry,
    this.notes,
    this.createdAt,
    this.updatedAt,
    this.syncedAt,
  });
}

// ============================================================================
// TICKET HIVE MODEL
// ============================================================================

@HiveType(typeId: 1)
class HiveTicket extends HiveObject {
  @HiveField(0)
  int id;

  @HiveField(1)
  String title;

  @HiveField(2)
  String? description;

  @HiveField(3)
  String? category;

  @HiveField(4)
  String priority;

  @HiveField(5)
  String status;

  @HiveField(6)
  String? assignedTo;

  @HiveField(7)
  int? assetId;

  @HiveField(8)
  String? dueDate;

  @HiveField(9)
  String? notes;

  @HiveField(10)
  DateTime? createdAt;

  @HiveField(11)
  DateTime? updatedAt;

  @HiveField(12)
  DateTime? syncedAt;

  HiveTicket({
    required this.id,
    required this.title,
    this.description,
    this.category,
    required this.priority,
    required this.status,
    this.assignedTo,
    this.assetId,
    this.dueDate,
    this.notes,
    this.createdAt,
    this.updatedAt,
    this.syncedAt,
  });
}

// ============================================================================
// SYNC METADATA
// ============================================================================

@HiveType(typeId: 2)
class HiveSyncMetadata extends HiveObject {
  @HiveField(0)
  String entityType; // 'asset' or 'ticket'

  @HiveField(1)
  int entityId;

  @HiveField(2)
  String operation; // 'create', 'update', 'delete'

  @HiveField(3)
  DateTime createdAt;

  @HiveField(4)
  bool synced;

  @HiveField(5)
  String? error;

  HiveSyncMetadata({
    required this.entityType,
    required this.entityId,
    required this.operation,
    required this.createdAt,
    this.synced = false,
    this.error,
  });
}

// ============================================================================
// CACHE METADATA
// ============================================================================

@HiveType(typeId: 3)
class HiveCacheMetadata extends HiveObject {
  @HiveField(0)
  String key; // 'assets_list', 'tickets_list', etc.

  @HiveField(1)
  DateTime cachedAt;

  @HiveField(2)
  DateTime? expiresAt;

  @HiveField(3)
  bool isValid;

  HiveCacheMetadata({
    required this.key,
    required this.cachedAt,
    this.expiresAt,
    this.isValid = true,
  });

  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

@HiveType(typeId: 4)
class HiveOfflineQueueItem extends HiveObject {
  @HiveField(0)
  String id; // UUID

  @HiveField(1)
  String endpoint; // e.g., '/api/v1/assets' or '/api/v1/tickets'

  @HiveField(2)
  String method; // 'GET', 'POST', 'PUT', 'DELETE'

  @HiveField(3)
  String payload; // JSON string of request body

  @HiveField(4)
  DateTime createdAt;

  @HiveField(5)
  int retryCount;

  @HiveField(6)
  DateTime? lastRetryAt;

  HiveOfflineQueueItem({
    required this.id,
    required this.endpoint,
    required this.method,
    required this.payload,
    required this.createdAt,
    this.retryCount = 0,
    this.lastRetryAt,
  });

  bool get shouldRetry => retryCount < 3; // Max 3 retries
}
