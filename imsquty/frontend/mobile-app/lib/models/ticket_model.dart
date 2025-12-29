// lib/models/ticket_model.dart

import 'package:json_annotation/json_annotation.dart';

part 'ticket_model.g.dart';

@JsonSerializable()
class Ticket {
  final int id;
  @JsonKey(name: 'ticket_number')
  final String ticketNumber;
  final String title;
  final String description;
  final String priority;
  final String status;
  @JsonKey(name: 'assigned_to')
  final String? assignedTo;
  @JsonKey(name: 'asset_id')
  final int? assetId;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  Ticket({
    required this.id,
    required this.ticketNumber,
    required this.title,
    required this.description,
    required this.priority,
    required this.status,
    this.assignedTo,
    this.assetId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) => _$TicketFromJson(json);
  Map<String, dynamic> toJson() => _$TicketToJson(this);

  Ticket copyWith({
    int? id,
    String? ticketNumber,
    String? title,
    String? description,
    String? priority,
    String? status,
    String? assignedTo,
    int? assetId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Ticket(
      id: id ?? this.id,
      ticketNumber: ticketNumber ?? this.ticketNumber,
      title: title ?? this.title,
      description: description ?? this.description,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      assetId: assetId ?? this.assetId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() =>
      'Ticket(id: $id, ticketNumber: $ticketNumber, title: $title, priority: $priority, status: $status)';
}

@JsonSerializable()
class TicketList {
  final List<Ticket> data;
  final PaginationMeta meta;

  TicketList({required this.data, required this.meta});

  factory TicketList.fromJson(Map<String, dynamic> json) =>
      _$TicketListFromJson(json);
  Map<String, dynamic> toJson() => _$TicketListToJson(this);
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
