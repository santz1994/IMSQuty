import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/services/master_data_api_service.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Master Data State
class MasterDataState {
  final Map<String, dynamic> data;
  final bool isLoading;
  final String? error;
  final DateTime? lastFetched;

  const MasterDataState({
    this.data = const {},
    this.isLoading = false,
    this.error,
    this.lastFetched,
  });

  MasterDataState copyWith({
    Map<String, dynamic>? data,
    bool? isLoading,
    String? error,
    DateTime? lastFetched,
  }) {
    return MasterDataState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      lastFetched: lastFetched ?? this.lastFetched,
    );
  }

  /// Check if data is fresh (less than 1 hour old)
  bool get isFresh {
    if (lastFetched == null) return false;
    final now = DateTime.now();
    final difference = now.difference(lastFetched!);
    return difference.inMinutes < 60;
  }
}

/// Master Data Notifier
class MasterDataNotifier extends StateNotifier<MasterDataState> {
  final MasterDataApiService _masterDataApiService;

  MasterDataNotifier(this._masterDataApiService)
    : super(const MasterDataState());

  /// Fetch all master data
  Future<void> fetchAllMasterData({bool force = false}) async {
    // Skip if data is fresh and not forced
    if (!force && state.isFresh && state.data.isNotEmpty) {
      AppLogger.info('Using cached master data');
      return;
    }

    try {
      AppLogger.info('Fetching all master data');
      state = state.copyWith(isLoading: true, error: null);

      final masterData = await _masterDataApiService.getAllMasterData();

      state = state.copyWith(
        data: masterData,
        isLoading: false,
        lastFetched: DateTime.now(),
      );

      AppLogger.info('Master data fetched successfully');
    } catch (e) {
      AppLogger.error('Failed to fetch master data', error: e);
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load reference data',
      );
    }
  }

  /// Get locations
  List<Map<String, dynamic>> getLocations() {
    return List<Map<String, dynamic>>.from(state.data['locations'] ?? []);
  }

  /// Get asset categories
  List<Map<String, dynamic>> getAssetCategories() {
    return List<Map<String, dynamic>>.from(
      state.data['asset_categories'] ?? [],
    );
  }

  /// Get manufacturers
  List<Map<String, dynamic>> getManufacturers() {
    return List<Map<String, dynamic>>.from(state.data['manufacturers'] ?? []);
  }

  /// Get users
  List<Map<String, dynamic>> getUsers() {
    return List<Map<String, dynamic>>.from(state.data['users'] ?? []);
  }

  /// Get user roles
  List<Map<String, dynamic>> getUserRoles() {
    return List<Map<String, dynamic>>.from(state.data['user_roles'] ?? []);
  }

  /// Get asset statuses
  List<Map<String, dynamic>> getAssetStatuses() {
    return List<Map<String, dynamic>>.from(state.data['asset_statuses'] ?? []);
  }

  /// Get ticket priorities
  List<Map<String, dynamic>> getTicketPriorities() {
    return List<Map<String, dynamic>>.from(
      state.data['ticket_priorities'] ?? [],
    );
  }

  /// Get ticket statuses
  List<Map<String, dynamic>> getTicketStatuses() {
    return List<Map<String, dynamic>>.from(state.data['ticket_statuses'] ?? []);
  }

  /// Get ticket categories
  List<Map<String, dynamic>> getTicketCategories() {
    return List<Map<String, dynamic>>.from(
      state.data['ticket_categories'] ?? [],
    );
  }

  /// Get meeting rooms
  List<Map<String, dynamic>> getMeetingRooms() {
    return List<Map<String, dynamic>>.from(state.data['meeting_rooms'] ?? []);
  }

  /// Get system configuration
  Map<String, dynamic> getSystemConfig() {
    return Map<String, dynamic>.from(state.data['config'] ?? {});
  }

  /// Refresh specific data type
  Future<void> refreshDataType(String dataType) async {
    try {
      AppLogger.info('Refreshing $dataType');
      await _masterDataApiService.refreshMasterDataCache(dataType);
      await fetchAllMasterData(force: true);
    } catch (e) {
      AppLogger.error('Failed to refresh $dataType', error: e);
    }
  }

  /// Clear cache
  void clearCache() {
    state = const MasterDataState();
    AppLogger.info('Master data cache cleared');
  }
}

/// Riverpod Providers

/// Master data service provider
final masterDataServiceProvider = Provider<MasterDataApiService>((ref) {
  return MasterDataApiService();
});

/// Master data provider
final masterDataProvider =
    StateNotifierProvider<MasterDataNotifier, MasterDataState>((ref) {
      final masterDataService = ref.watch(masterDataServiceProvider);
      return MasterDataNotifier(masterDataService);
    });

/// Locations provider
final locationsProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getLocations();
});

/// Asset categories provider
final assetCategoriesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getAssetCategories();
});

/// Manufacturers provider
final manufacturersProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getManufacturers();
});

/// Users provider
final usersProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getUsers();
});

/// User roles provider
final userRolesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getUserRoles();
});

/// Asset statuses provider
final assetStatusesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getAssetStatuses();
});

/// Ticket priorities provider
final ticketPrioritiesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getTicketPriorities();
});

/// Ticket statuses provider
final ticketStatusesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getTicketStatuses();
});

/// Ticket categories provider
final ticketCategoriesProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getTicketCategories();
});

/// Meeting rooms provider
final meetingRoomsProvider = Provider<List<Map<String, dynamic>>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getMeetingRooms();
});

/// System config provider
final systemConfigProvider = Provider<Map<String, dynamic>>((ref) {
  final notifier = ref.watch(masterDataProvider.notifier);
  return notifier.getSystemConfig();
});

/// Master data is loading provider
final masterDataLoadingProvider = Provider<bool>((ref) {
  return ref.watch(masterDataProvider).isLoading;
});

/// Master data error provider
final masterDataErrorProvider = Provider<String?>((ref) {
  return ref.watch(masterDataProvider).error;
});
