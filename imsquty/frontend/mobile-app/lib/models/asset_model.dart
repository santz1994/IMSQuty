// lib/models/asset_model.dart

import 'package:json_annotation/json_annotation.dart';

part 'asset_model.g.dart';

@JsonSerializable()
class Asset {
  final int id;
  @JsonKey(name: 'asset_tag')
  final String assetTag;
  final String name;
  @JsonKey(name: 'serial_number')
  final String serialNumber;
  final String status;
  final String? location;
  @JsonKey(name: 'assigned_to')
  final String? assignedTo;
  @JsonKey(name: 'asset_type')
  final String? assetType;
  final String? manufacturer;
  @JsonKey(name: 'purchase_date')
  final DateTime? purchaseDate;
  @JsonKey(name: 'warranty_expiry')
  final DateTime? warrantyExpiry;
  final String? notes;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Asset({
    required this.id,
    required this.assetTag,
    required this.name,
    required this.serialNumber,
    required this.status,
    this.location,
    this.assignedTo,
    this.assetType,
    this.manufacturer,
    this.purchaseDate,
    this.warrantyExpiry,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Asset.fromJson(Map<String, dynamic> json) => _$AssetFromJson(json);
  Map<String, dynamic> toJson() => _$AssetToJson(this);

  Asset copyWith({
    int? id,
    String? assetTag,
    String? name,
    String? serialNumber,
    String? status,
    String? location,
    String? assignedTo,
    String? assetType,
    String? manufacturer,
    DateTime? purchaseDate,
    DateTime? warrantyExpiry,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Asset(
      id: id ?? this.id,
      assetTag: assetTag ?? this.assetTag,
      name: name ?? this.name,
      serialNumber: serialNumber ?? this.serialNumber,
      status: status ?? this.status,
      location: location ?? this.location,
      assignedTo: assignedTo ?? this.assignedTo,
      assetType: assetType ?? this.assetType,
      manufacturer: manufacturer ?? this.manufacturer,
      purchaseDate: purchaseDate ?? this.purchaseDate,
      warrantyExpiry: warrantyExpiry ?? this.warrantyExpiry,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() =>
      'Asset(id: $id, assetTag: $assetTag, name: $name, status: $status)';
}

@JsonSerializable()
class AssetList {
  final List<Asset> data;
  final PaginationMeta meta;

  AssetList({required this.data, required this.meta});

  factory AssetList.fromJson(Map<String, dynamic> json) =>
      _$AssetListFromJson(json);
  Map<String, dynamic> toJson() => _$AssetListToJson(this);
}

@JsonSerializable()
class PaginationMeta {
  final int total;
  @JsonKey(name: 'per_page')
  final int perPage;
  @JsonKey(name: 'current_page')
  final int currentPage;
  @JsonKey(name: 'last_page')
  final int lastPage;

  PaginationMeta({
    required this.total,
    required this.perPage,
    required this.currentPage,
    required this.lastPage,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) =>
      _$PaginationMetaFromJson(json);
  Map<String, dynamic> toJson() => _$PaginationMetaToJson(this);
}
