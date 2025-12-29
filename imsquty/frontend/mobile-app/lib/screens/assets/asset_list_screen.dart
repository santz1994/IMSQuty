// lib/screens/assets/asset_list_screen.dart
// Asset List Screen with pagination, search, and filters
// Task 5.1 Implementation | 300+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/config/app_theme.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/providers/asset_provider.dart';
import 'package:imsquty_mobile/providers/master_data_provider.dart';

class AssetListScreen extends ConsumerStatefulWidget {
  const AssetListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AssetListScreen> createState() => _AssetListScreenState();
}

class _AssetListScreenState extends ConsumerState<AssetListScreen> {
  late TextEditingController _searchController;
  String _selectedStatus = 'all';
  String _selectedLocation = 'all';
  int _currentPage = 1;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _currentPage = 1;
    if (query.isEmpty) {
      ref.read(assetListProvider.notifier).fetchAssets();
    } else {
      ref.read(assetListProvider.notifier).search(query);
    }
  }

  void _onStatusFilterChanged(String? status) {
    if (status != null) {
      setState(() {
        _selectedStatus = status;
        _currentPage = 1;
      });
      if (status == 'all') {
        ref.read(assetListProvider.notifier).fetchAssets();
      } else {
        ref.read(assetListProvider.notifier).filterByStatus(status);
      }
    }
  }

  void _onLocationFilterChanged(String? location) {
    if (location != null) {
      setState(() {
        _selectedLocation = location;
        _currentPage = 1;
      });
      if (location == 'all') {
        ref.read(assetListProvider.notifier).fetchAssets();
      } else {
        ref.read(assetListProvider.notifier).filterByLocation(location);
      }
    }
  }

  void _nextPage() {
    setState(() => _currentPage++);
    ref.read(assetListProvider.notifier).nextPage();
  }

  void _previousPage() {
    if (_currentPage > 1) {
      setState(() => _currentPage--);
      ref.read(assetListProvider.notifier).previousPage();
    }
  }

  void _deleteAsset(int assetId, String assetName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Asset?'),
        content: Text('Are you sure you want to delete "$assetName"?'),
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
                  .deleteAsset(assetId)
                  .then((_) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Asset deleted successfully'),
                      ),
                    );
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
    final assetListAsync = ref.watch(assetListProvider);
    final masterDataAsync = ref.watch(masterDataProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assets'),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: assetListAsync.when(
        data: (assetListState) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.read(assetListProvider.notifier).fetchAssets();
            },
            child: CustomScrollView(
              slivers: [
                // Search and Filter Bar
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Search Field
                        TextField(
                          controller: _searchController,
                          onChanged: _onSearchChanged,
                          decoration: InputDecoration(
                            hintText: 'Search by name, serial, model...',
                            prefixIcon: const Icon(Icons.search),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear),
                                    onPressed: () {
                                      _searchController.clear();
                                      _onSearchChanged('');
                                    },
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            contentPadding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Filter Chips
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              // Status Filter
                              FilterChip(
                                label: const Text('Status'),
                                selected: false,
                                onSelected: (_) {},
                              ),
                              const SizedBox(width: 8),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[300]!),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: DropdownButton<String>(
                                  value: _selectedStatus,
                                  underline: const SizedBox(),
                                  items: [
                                    const DropdownMenuItem(
                                      value: 'all',
                                      child: Text('  All Status  '),
                                    ),
                                    const DropdownMenuItem(
                                      value: 'new',
                                      child: Text('  New  '),
                                    ),
                                    const DropdownMenuItem(
                                      value: 'in_use',
                                      child: Text('  In Use  '),
                                    ),
                                    const DropdownMenuItem(
                                      value: 'maintenance',
                                      child: Text('  Maintenance  '),
                                    ),
                                    const DropdownMenuItem(
                                      value: 'retired',
                                      child: Text('  Retired  '),
                                    ),
                                  ],
                                  onChanged: _onStatusFilterChanged,
                                ),
                              ),
                              const SizedBox(width: 8),
                              // Location Filter
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[300]!),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: DropdownButton<String>(
                                  value: _selectedLocation,
                                  underline: const SizedBox(),
                                  items: [
                                    const DropdownMenuItem(
                                      value: 'all',
                                      child: Text('  All Locations  '),
                                    ),
                                    ...masterDataAsync.whenData((data) {
                                          final locations =
                                              data['locations']
                                                  as List<dynamic>?;
                                          return locations
                                                  ?.map(
                                                    (loc) => DropdownMenuItem(
                                                      value: loc['id']
                                                          .toString(),
                                                      child: Text(
                                                        '  ${loc['name']}  ',
                                                      ),
                                                    ),
                                                  )
                                                  .toList() ??
                                              [];
                                        }).value ??
                                        [],
                                  ],
                                  onChanged: _onLocationFilterChanged,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Asset List
                if (assetListState.assets.isEmpty)
                  SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 60),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inventory_2,
                              size: 80,
                              color: Colors.grey[300],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No Assets Found',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Try adjusting your search or filters',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final asset = assetListState.assets[index];
                      return _AssetCard(
                        asset: asset,
                        onTap: () => context.push('/home/assets/${asset.id}'),
                        onDelete: () => _deleteAsset(asset.id, asset.name),
                      );
                    }, childCount: assetListState.assets.length),
                  ),
                // Pagination Controls
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ElevatedButton.icon(
                          icon: const Icon(Icons.chevron_left),
                          label: const Text('Previous'),
                          onPressed: _currentPage > 1 ? _previousPage : null,
                        ),
                        Text(
                          'Page $_currentPage of ${(assetListState.total / 20).ceil()}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.chevron_right),
                          label: const Text('Next'),
                          onPressed:
                              _currentPage < (assetListState.total / 20).ceil()
                              ? _nextPage
                              : null,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error, size: 80, color: Colors.red[300]),
              const SizedBox(height: 16),
              const Text('Error Loading Assets'),
              const SizedBox(height: 8),
              Text(error.toString(), textAlign: TextAlign.center),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                onPressed: () => ref.refresh(assetListProvider),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/home/assets/create'),
        icon: const Icon(Icons.add),
        label: const Text('New Asset'),
      ),
    );
  }
}

/// Asset Card Widget
class _AssetCard extends StatelessWidget {
  final Asset asset;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _AssetCard({
    required this.asset,
    required this.onTap,
    required this.onDelete,
  });

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

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
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
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${asset.model ?? 'N/A'} • ${asset.serialNumber ?? 'No Serial'}',
                          style: Theme.of(
                            context,
                          ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'delete') {
                        onDelete();
                      }
                    },
                    itemBuilder: (BuildContext context) => [
                      const PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(Icons.delete, color: Colors.red),
                            SizedBox(width: 8),
                            Text('Delete'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Chip(
                    label: Text(asset.status.toUpperCase()),
                    backgroundColor: _getStatusColor(
                      asset.status,
                    ).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color: _getStatusColor(asset.status),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (asset.location != null)
                    Text(
                      asset.location!,
                      style: Theme.of(
                        context,
                      ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
