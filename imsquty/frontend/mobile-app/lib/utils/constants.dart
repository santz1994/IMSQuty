// lib/utils/constants.dart

class AppConstants {
  // App Info
  static const String appName = 'IMSQuty Mobile';
  static const String appVersion = '1.0.0';

  // Shared Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'current_user';
  static const String lastSyncKey = 'last_sync';

  // Error Messages
  static const String errorUnauthorized = 'Unauthorized. Please login again.';
  static const String errorServerError =
      'Server error. Please try again later.';
  static const String errorNetworkError =
      'Network error. Please check your connection.';
  static const String errorNoData = 'No data available';
  static const String errorLoadingFailed = 'Failed to load data';
  static const String errorSavingFailed = 'Failed to save data';

  // Success Messages
  static const String successCreated = 'Created successfully';
  static const String successUpdated = 'Updated successfully';
  static const String successDeleted = 'Deleted successfully';
  static const String successSaved = 'Saved successfully';

  // Pagination
  static const int defaultPageSize = 20;

  // Validation
  static const int minPasswordLength = 8;
  static const int maxNameLength = 255;

  // Durations
  static const Duration tokenRefreshDuration = Duration(minutes: 14);
  static const Duration syncInterval = Duration(minutes: 5);
  static const Duration debounceDelay = Duration(milliseconds: 500);
}

class AssetStatus {
  static const String active = 'active';
  static const String inactive = 'inactive';
  static const String maintenance = 'maintenance';
  static const String disposed = 'disposed';

  static List<String> getAll() => [active, inactive, maintenance, disposed];
}

class TicketPriority {
  static const String low = 'low';
  static const String medium = 'medium';
  static const String high = 'high';
  static const String critical = 'critical';

  static List<String> getAll() => [low, medium, high, critical];
}

class TicketStatus {
  static const String open = 'open';
  static const String inProgress = 'in_progress';
  static const String resolved = 'resolved';
  static const String closed = 'closed';

  static List<String> getAll() => [open, inProgress, resolved, closed];
}
