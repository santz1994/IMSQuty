import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/services/asset_api_service.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Asset List State - Represents paginated asset list
class AssetListState {
  final List<Asset> assets;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final int totalPages;
  final int total;
  final String? searchQuery;
  final String? statusFilter;
  final String? locationFilter;

  const AssetListState({
    this.assets = const [],
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.totalPages = 1,
    this.total = 0,
    this.searchQuery,
    this.statusFilter,
    this.locationFilter,
  });

  /// Create copy with modifications
  AssetListState copyWith({
    List<Asset>? assets,
    bool? isLoading,
    String? error,
    int? currentPage,
    int? totalPages,
    int? total,
    String? searchQuery,
    String? statusFilter,
    String? locationFilter,
  }) {
    return AssetListState(
      assets: assets ?? this.assets,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      total: total ?? this.total,
      searchQuery: searchQuery ?? this.searchQuery,
      statusFilter: statusFilter ?? this.statusFilter,
      locationFilter: locationFilter ?? this.locationFilter,
    );
  }

  /// Check if has next page
  bool get hasNextPage => currentPage < totalPages;

  /// Check if has previous page
  bool get hasPreviousPage => currentPage > 1;
}

/// Asset Detail State
class AssetDetailState {
  final Asset? asset;
  final bool isLoading;
  final String? error;

  const AssetDetailState({this.asset, this.isLoading = false, this.error});

  AssetDetailState copyWith({Asset? asset, bool? isLoading, String? error}) {
    return AssetDetailState(
      asset: asset ?? this.asset,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Asset List Notifier
class AssetListNotifier extends StateNotifier<AssetListState> {
  final AssetApiService _assetApiService;

  AssetListNotifier(this._assetApiService) : super(const AssetListState());

  /// Fetch assets for current page with filters
  Future<void> fetchAssets({
    int? page,
    String? search,
    String? status,
    String? location,
  }) async {
    try {
      final pageNum = page ?? state.currentPage;
      AppLogger.info('Fetching assets - page: $pageNum');

      state = state.copyWith(
        isLoading: true,
        error: null,
        searchQuery: search ?? state.searchQuery,
        statusFilter: status ?? state.statusFilter,
        locationFilter: location ?? state.locationFilter,
      );

      final assetList = await _assetApiService.getAssets(
        page: pageNum,
        perPage: ApiConfig.defaultPageSize,
        search: search,
        status: status,
        location: location,
      );

      state = state.copyWith(
        assets: assetList.data,
        currentPage: assetList.meta.currentPage,
        totalPages: assetList.meta.lastPage,
        total: assetList.meta.total,
        isLoading: false,
      );

      AppLogger.info('Fetched ${assetList.data.length} assets');
    } catch (e) {
      AppLogger.error('Failed to fetch assets', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
    }
  }

  /// Go to next page
  Future<void> nextPage() async {
    if (state.hasNextPage) {
      await fetchAssets(page: state.currentPage + 1);
    }
  }

  /// Go to previous page
  Future<void> previousPage() async {
    if (state.hasPreviousPage) {
      await fetchAssets(page: state.currentPage - 1);
    }
  }

  /// Go to specific page
  Future<void> goToPage(int page) async {
    if (page > 0 && page <= state.totalPages) {
      await fetchAssets(page: page);
    }
  }

  /// Search assets
  Future<void> search(String query) async {
    await fetchAssets(page: 1, search: query.isEmpty ? null : query);
  }

  /// Filter by status
  Future<void> filterByStatus(String? status) async {
    await fetchAssets(page: 1, status: status);
  }

  /// Filter by location
  Future<void> filterByLocation(String? location) async {
    await fetchAssets(page: 1, location: location);
  }

  /// Clear all filters and search
  Future<void> clearFilters() async {
    await fetchAssets(page: 1);
  }

  /// Refresh current page
  Future<void> refresh() async {
    await fetchAssets(
      page: state.currentPage,
      search: state.searchQuery,
      status: state.statusFilter,
      location: state.locationFilter,
    );
  }

  /// Create new asset
  Future<Asset> createAsset(Map<String, dynamic> assetData) async {
    try {
      AppLogger.info('Creating new asset');
      state = state.copyWith(isLoading: true, error: null);

      final asset = await _assetApiService.createAsset(assetData);

      // Refresh list to include new asset
      await refresh();

      return asset;
    } catch (e) {
      AppLogger.error('Failed to create asset', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Delete asset
  Future<void> deleteAsset(int id) async {
    try {
      AppLogger.info('Deleting asset: $id');

      await _assetApiService.deleteAsset(id);

      // Remove from list
      state = state.copyWith(
        assets: state.assets.where((a) => a.id != id).toList(),
      );

      AppLogger.info('Asset deleted');
    } catch (e) {
      AppLogger.error('Failed to delete asset', error: e);
      state = state.copyWith(error: _extractErrorMessage(e));
      rethrow;
    }
  }

  String _extractErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'Failed to fetch assets. Please try again.';
  }
}

/// Asset Detail Notifier
class AssetDetailNotifier extends StateNotifier<AssetDetailState> {
  final AssetApiService _assetApiService;

  AssetDetailNotifier(this._assetApiService) : super(const AssetDetailState());

  /// Fetch asset details by ID
  Future<void> fetchAsset(int id) async {
    try {
      AppLogger.info('Fetching asset details: $id');
      state = state.copyWith(isLoading: true, error: null);

      final asset = await _assetApiService.getAsset(id);

      state = state.copyWith(asset: asset, isLoading: false);

      AppLogger.info('Asset details loaded');
    } catch (e) {
      AppLogger.error('Failed to fetch asset', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
    }
  }

  /// Update asset
  Future<Asset> updateAsset(int id, Map<String, dynamic> assetData) async {
    try {
      AppLogger.info('Updating asset: $id');
      state = state.copyWith(isLoading: true, error: null);

      final updatedAsset = await _assetApiService.updateAsset(id, assetData);

      state = state.copyWith(asset: updatedAsset, isLoading: false);

      return updatedAsset;
    } catch (e) {
      AppLogger.error('Failed to update asset', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Clear error
  void clearError() {
    state = state.copyWith(error: null);
  }

  String _extractErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'An error occurred. Please try again.';
  }
}

/// Riverpod Providers

/// Asset API service provider
final assetApiServiceProvider = Provider<AssetApiService>((ref) {
  return AssetApiService();
});

/// Asset list provider
final assetListProvider =
    StateNotifierProvider<AssetListNotifier, AssetListState>((ref) {
      final assetApiService = ref.watch(assetApiServiceProvider);
      return AssetListNotifier(assetApiService);
    });

/// Asset detail provider with ID parameter
final assetDetailProvider =
    StateNotifierProvider.family<AssetDetailNotifier, AssetDetailState, int>((
      ref,
      assetId,
    ) {
      final assetApiService = ref.watch(assetApiServiceProvider);
      final notifier = AssetDetailNotifier(assetApiService);
      // Auto-fetch on creation
      notifier.fetchAsset(assetId);
      return notifier;
    });

/// Computed: Total asset count
final assetCountProvider = Provider<int>((ref) {
  return ref.watch(assetListProvider).total;
});

/// Computed: Assets per page
final assetsPerPageProvider = Provider<int>((ref) {
  return ApiConfig.defaultPageSize;
});

/// Computed: Asset pagination info
final assetPaginationProvider = Provider<Map<String, dynamic>>((ref) {
  final state = ref.watch(assetListProvider);
  return {
    'currentPage': state.currentPage,
    'totalPages': state.totalPages,
    'total': state.total,
    'hasNextPage': state.hasNextPage,
    'hasPreviousPage': state.hasPreviousPage,
  };
});
