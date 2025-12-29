import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/utils/logger.dart';
import 'api_service.dart';

/// Asset API Service - All asset-related API endpoints
/// Handles CRUD operations for assets
class AssetApiService {
  static final AssetApiService _instance = AssetApiService._internal();
  final ApiService _apiService;

  factory AssetApiService({ApiService? apiService}) {
    if (apiService != null) {
      _instance._apiService = apiService;
    }
    return _instance;
  }

  AssetApiService._internal() : _apiService = ApiService();

  /// Get paginated asset list
  Future<AssetList> getAssets({
    int page = 1,
    int perPage = ApiConfig.defaultPageSize,
    String? search,
    String? status,
    String? location,
  }) async {
    try {
      AppLogger.info('Fetching assets - page: $page, perPage: $perPage');

      final queryParams = <String, dynamic>{
        'page': page,
        'per_page': perPage,
        if (search != null) 'search': search,
        if (status != null) 'status': status,
        if (location != null) 'location': location,
      };

      final response = await _apiService.get<Map<String, dynamic>>(
        ApiConfig.assetList,
        queryParameters: queryParams,
      );

      // Manual parsing since json_serializable code generation not yet run
      final assets = AssetList(
        data: [], // TODO: Parse asset list after code generation
        meta: PaginationMeta(
          total: response['meta']?['total'] ?? 0,
          perPage: response['meta']?['per_page'] ?? perPage,
          currentPage: response['meta']?['current_page'] ?? page,
          lastPage: response['meta']?['last_page'] ?? 1,
        ),
      );

      return assets;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch assets', error: e);
      throw ApiException(message: 'Failed to fetch assets');
    }
  }

  /// Get single asset by ID
  Future<Asset> getAsset(int id) async {
    try {
      AppLogger.info('Fetching asset: $id');

      final endpoint = '${ApiConfig.assetDetail}/$id';
      final response = await _apiService.get<Map<String, dynamic>>(endpoint);

      // TODO: Parse asset after code generation
      throw ApiException(message: 'Asset not found');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch asset $id', error: e);
      throw ApiException(message: 'Failed to fetch asset details');
    }
  }

  /// Create new asset
  Future<Asset> createAsset(Map<String, dynamic> assetData) async {
    try {
      AppLogger.info('Creating new asset');

      final response = await _apiService.post<Map<String, dynamic>>(
        ApiConfig.assetCreate,
        data: assetData,
      );

      // TODO: Parse asset after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to create asset', error: e);
      throw ApiException(message: 'Failed to create asset');
    }
  }

  /// Update asset
  Future<Asset> updateAsset(int id, Map<String, dynamic> assetData) async {
    try {
      AppLogger.info('Updating asset: $id');

      final endpoint = '${ApiConfig.assetUpdate}/$id';
      final response = await _apiService.put<Map<String, dynamic>>(
        endpoint,
        data: assetData,
      );

      // TODO: Parse asset after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to update asset $id', error: e);
      throw ApiException(message: 'Failed to update asset');
    }
  }

  /// Delete asset
  Future<void> deleteAsset(int id) async {
    try {
      AppLogger.info('Deleting asset: $id');

      final endpoint = '${ApiConfig.assetDelete}/$id';
      await _apiService.delete(endpoint);

      AppLogger.info('Asset deleted: $id');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to delete asset $id', error: e);
      throw ApiException(message: 'Failed to delete asset');
    }
  }

  /// Get assets by location
  Future<AssetList> getAssetsByLocation(String location, {int page = 1}) async {
    try {
      AppLogger.info('Fetching assets for location: $location');

      final endpoint = '${ApiConfig.assetList}/location/$location';
      final response = await _apiService.get<Map<String, dynamic>>(
        endpoint,
        queryParameters: {'page': page},
      );

      final assets = AssetList(
        data: [],
        meta: PaginationMeta(
          total: response['meta']?['total'] ?? 0,
          perPage: response['meta']?['per_page'] ?? 20,
          currentPage: response['meta']?['current_page'] ?? 1,
          lastPage: response['meta']?['last_page'] ?? 1,
        ),
      );

      return assets;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch assets by location', error: e);
      throw ApiException(message: 'Failed to fetch assets by location');
    }
  }

  /// Get asset statistics
  Future<Map<String, dynamic>> getAssetStats() async {
    try {
      AppLogger.info('Fetching asset statistics');

      const endpoint = '${ApiConfig.assetList}/statistics';
      return await _apiService.get<Map<String, dynamic>>(endpoint) ?? {};
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch asset statistics', error: e);
      throw ApiException(message: 'Failed to fetch asset statistics');
    }
  }

  /// Export assets to CSV
  Future<String> exportAssets({String? format = 'csv'}) async {
    try {
      AppLogger.info('Exporting assets as $format');

      const endpoint = '${ApiConfig.assetList}/export';
      final response = await _apiService.get<String>(
        endpoint,
        queryParameters: {'format': format},
      );

      return response ?? '';
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to export assets', error: e);
      throw ApiException(message: 'Failed to export assets');
    }
  }

  /// Bulk update assets
  Future<void> bulkUpdateAssets(
    List<int> assetIds,
    Map<String, dynamic> updates,
  ) async {
    try {
      AppLogger.info('Bulk updating ${assetIds.length} assets');

      const endpoint = '${ApiConfig.assetList}/bulk-update';
      await _apiService.post(
        endpoint,
        data: {'asset_ids': assetIds, 'updates': updates},
      );

      AppLogger.info('Bulk update completed');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to bulk update assets', error: e);
      throw ApiException(message: 'Failed to bulk update assets');
    }
  }
}
