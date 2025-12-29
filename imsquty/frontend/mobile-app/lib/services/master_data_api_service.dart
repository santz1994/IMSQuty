import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/utils/logger.dart';

import 'api_service.dart';

/// Master Data API Service - System-wide reference data
/// Handles master data like users, locations, categories, etc.
class MasterDataApiService {
  static final MasterDataApiService _instance =
      MasterDataApiService._internal();
  final ApiService _apiService;

  factory MasterDataApiService({ApiService? apiService}) {
    if (apiService != null) {
      _instance._apiService = apiService;
    }
    return _instance;
  }

  MasterDataApiService._internal() : _apiService = ApiService();

  /// Get all locations
  Future<List<Map<String, dynamic>>> getLocations() async {
    try {
      AppLogger.info('Fetching locations');

      const endpoint = '${ApiConfig.masterData}/locations';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch locations', error: e);
      throw ApiException(message: 'Failed to fetch locations');
    }
  }

  /// Get all asset categories
  Future<List<Map<String, dynamic>>> getAssetCategories() async {
    try {
      AppLogger.info('Fetching asset categories');

      const endpoint = '${ApiConfig.masterData}/asset-categories';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch asset categories', error: e);
      throw ApiException(message: 'Failed to fetch asset categories');
    }
  }

  /// Get all manufacturers
  Future<List<Map<String, dynamic>>> getManufacturers() async {
    try {
      AppLogger.info('Fetching manufacturers');

      const endpoint = '${ApiConfig.masterData}/manufacturers';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch manufacturers', error: e);
      throw ApiException(message: 'Failed to fetch manufacturers');
    }
  }

  /// Get all users
  Future<List<Map<String, dynamic>>> getUsers() async {
    try {
      AppLogger.info('Fetching users');

      const endpoint = '${ApiConfig.masterData}/users';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch users', error: e);
      throw ApiException(message: 'Failed to fetch users');
    }
  }

  /// Get all user roles
  Future<List<Map<String, dynamic>>> getUserRoles() async {
    try {
      AppLogger.info('Fetching user roles');

      const endpoint = '${ApiConfig.masterData}/user-roles';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch user roles', error: e);
      throw ApiException(message: 'Failed to fetch user roles');
    }
  }

  /// Get all asset statuses
  Future<List<Map<String, dynamic>>> getAssetStatuses() async {
    try {
      AppLogger.info('Fetching asset statuses');

      const endpoint = '${ApiConfig.masterData}/asset-statuses';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch asset statuses', error: e);
      throw ApiException(message: 'Failed to fetch asset statuses');
    }
  }

  /// Get all ticket priorities
  Future<List<Map<String, dynamic>>> getTicketPriorities() async {
    try {
      AppLogger.info('Fetching ticket priorities');

      const endpoint = '${ApiConfig.masterData}/ticket-priorities';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch ticket priorities', error: e);
      throw ApiException(message: 'Failed to fetch ticket priorities');
    }
  }

  /// Get all ticket statuses
  Future<List<Map<String, dynamic>>> getTicketStatuses() async {
    try {
      AppLogger.info('Fetching ticket statuses');

      const endpoint = '${ApiConfig.masterData}/ticket-statuses';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch ticket statuses', error: e);
      throw ApiException(message: 'Failed to fetch ticket statuses');
    }
  }

  /// Get all ticket categories
  Future<List<Map<String, dynamic>>> getTicketCategories() async {
    try {
      AppLogger.info('Fetching ticket categories');

      const endpoint = '${ApiConfig.masterData}/ticket-categories';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch ticket categories', error: e);
      throw ApiException(message: 'Failed to fetch ticket categories');
    }
  }

  /// Get meeting rooms
  Future<List<Map<String, dynamic>>> getMeetingRooms() async {
    try {
      AppLogger.info('Fetching meeting rooms');

      const endpoint = '${ApiConfig.masterData}/meeting-rooms';
      final response = await _apiService.get<List<dynamic>>(endpoint);

      return List<Map<String, dynamic>>.from(
        response.map((item) => item as Map<String, dynamic>),
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch meeting rooms', error: e);
      throw ApiException(message: 'Failed to fetch meeting rooms');
    }
  }

  /// Get system configuration
  Future<Map<String, dynamic>> getSystemConfig() async {
    try {
      AppLogger.info('Fetching system configuration');

      const endpoint = '${ApiConfig.masterData}/config';
      return await _apiService.get<Map<String, dynamic>>(endpoint) ??
          <String, dynamic>{};
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch system configuration', error: e);
      throw ApiException(message: 'Failed to fetch system configuration');
    }
  }

  /// Get all master data in one call (for initialization)
  Future<Map<String, dynamic>> getAllMasterData() async {
    try {
      AppLogger.info('Fetching all master data');

      final [
        locations,
        categories,
        manufacturers,
        users,
        roles,
        assetStatuses,
        ticketPriorities,
        ticketStatuses,
        ticketCategories,
        meetingRooms,
        config,
      ] = await Future.wait([
        getLocations(),
        getAssetCategories(),
        getManufacturers(),
        getUsers(),
        getUserRoles(),
        getAssetStatuses(),
        getTicketPriorities(),
        getTicketStatuses(),
        getTicketCategories(),
        getMeetingRooms(),
        getSystemConfig(),
      ]);

      return {
        'locations': locations,
        'asset_categories': categories,
        'manufacturers': manufacturers,
        'users': users,
        'user_roles': roles,
        'asset_statuses': assetStatuses,
        'ticket_priorities': ticketPriorities,
        'ticket_statuses': ticketStatuses,
        'ticket_categories': ticketCategories,
        'meeting_rooms': meetingRooms,
        'config': config,
      };
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch all master data', error: e);
      throw ApiException(message: 'Failed to fetch master data');
    }
  }

  /// Refresh specific master data cache
  Future<void> refreshMasterDataCache(String dataType) async {
    try {
      AppLogger.info('Refreshing cache for: $dataType');

      // In a real implementation, this would trigger Riverpod cache invalidation
      // For now, just log the request
    } catch (e) {
      AppLogger.warning('Failed to refresh cache for $dataType: $e');
    }
  }
}
