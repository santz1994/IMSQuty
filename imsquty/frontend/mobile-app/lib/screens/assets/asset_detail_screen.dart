// lib/screens/assets/asset_detail_screen.dart
// Asset Detail Screen with full information and edit/delete
// Task 5.2 Implementation | 350+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/providers/asset_provider.dart';
import 'package:imsquty_mobile/providers/ticket_provider.dart';

class AssetDetailScreen extends ConsumerStatefulWidget {
  final int assetId;

  const AssetDetailScreen({Key? key, required this.assetId}) : super(key: key);

  @override
  ConsumerState<AssetDetailScreen> createState() => _AssetDetailScreenState();
}

class _AssetDetailScreenState extends ConsumerState<AssetDetailScreen> {
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _deleteAsset(Asset asset) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Asset?'),
        content: Text(
          'Are you sure you want to permanently delete "${asset.name}"?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref
                  .read(assetListProvider.notifier)
                  .deleteAsset(asset.id)
                  .then((_) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Asset deleted successfully'),
                      ),
                    );
                    context.pop();
                  })
                  .catchError((error) {
                    ScaffoldMessenger.of(
                      context,
                    ).showSnackBar(SnackBar(content: Text('Error: $error')));
                  });
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final assetAsync = ref.watch(assetDetailProvider(widget.assetId));
    final relatedTicketsAsync = ref.watch(
      ticketListProvider,
    ); // Could be filtered by asset

    return Scaffold(
      appBar: AppBar(
        title: const Text('Asset Details'),
        elevation: 0,
        scrolledUnderElevation: 0,
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'edit') {
                context.push('/home/assets/${widget.assetId}/edit');
              } else if (value == 'delete') {
                assetAsync.whenData((asset) => _deleteAsset(asset));
              }
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit),
                    SizedBox(width: 8),
                    Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Delete', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: assetAsync.when(
        data: (asset) {
          return CustomScrollView(
            controller: _scrollController,
            slivers: [
              // Header Section
              SliverToBoxAdapter(
                child: Container(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  asset.name,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall
                                      ?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'ID: ${asset.id}',
                                  style: Theme.of(context).textTheme.bodySmall
                                      ?.copyWith(color: Colors.grey),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: _getStatusColor(
                                asset.status,
                              ).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              asset.status.toUpperCase(),
                              style: TextStyle(
                                color: _getStatusColor(asset.status),
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Basic Information Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Basic Information',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _buildDetailRow('Model', asset.model ?? 'N/A'),
                              _buildDivider(),
                              _buildDetailRow(
                                'Serial Number',
                                asset.serialNumber ?? 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow('Type', asset.type ?? 'N/A'),
                              _buildDivider(),
                              _buildDetailRow(
                                'Category',
                                asset.category ?? 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Manufacturer',
                                asset.manufacturer ?? 'N/A',
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Location and Assignment Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Location & Assignment',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _buildDetailRow(
                                'Location',
                                asset.location ?? 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Assigned To',
                                asset.assignedTo ?? 'Unassigned',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Department',
                                asset.department ?? 'N/A',
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Financial Information Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Financial Information',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            children: [
                              _buildDetailRow(
                                'Purchase Price',
                                asset.purchasePrice != null
                                    ? '\$${asset.purchasePrice!.toStringAsFixed(2)}'
                                    : 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Purchase Date',
                                asset.purchaseDate ?? 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Warranty Type',
                                asset.warrantyType ?? 'N/A',
                              ),
                              _buildDivider(),
                              _buildDetailRow(
                                'Warranty Expiry',
                                asset.warrantyExpiry ?? 'N/A',
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Related Tickets Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Related Tickets',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      relatedTicketsAsync.when(
                        data: (ticketList) {
                          // Filter tickets related to this asset
                          final relatedTickets = ticketList.tickets
                              .where(
                                (t) =>
                                    t.assetId.toString() == asset.id.toString(),
                              )
                              .toList();

                          if (relatedTickets.isEmpty) {
                            return Card(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Center(
                                  child: Text(
                                    'No related tickets',
                                    style: Theme.of(context)
                                        .textTheme
                                        .bodyMedium
                                        ?.copyWith(color: Colors.grey),
                                  ),
                                ),
                              ),
                            );
                          }

                          return Column(
                            children: relatedTickets.take(5).map((ticket) {
                              return Card(
                                child: ListTile(
                                  title: Text(
                                    ticket.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Text(
                                    'ID: ${ticket.id} • ${ticket.status}',
                                  ),
                                  trailing: const Icon(Icons.chevron_right),
                                  onTap: () => context.push(
                                    '/home/tickets/${ticket.id}',
                                  ),
                                ),
                              );
                            }).toList(),
                          );
                        },
                        loading: () => const Card(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        error: (error, stack) => Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Text('Error loading tickets'),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Notes Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notes',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Text(
                            asset.notes ?? 'No notes',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(
                                  color: asset.notes == null
                                      ? Colors.grey
                                      : Colors.black87,
                                ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error, size: 80, color: Colors.red[300]),
              const SizedBox(height: 16),
              const Text('Error Loading Asset'),
              const SizedBox(height: 8),
              Text(error.toString()),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                onPressed: () =>
                    ref.refresh(assetDetailProvider(widget.assetId)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
        ),
        Text(
          value,
          style: Theme.of(
            context,
          ).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildDivider() => Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Divider(height: 1),
  );

  Color _getStatusColor(String status) {
    switch (status) {
      case 'new':
        return Colors.blue;
      case 'in_use':
        return Colors.green;
      case 'maintenance':
        return Colors.orange;
      case 'retired':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }
}
