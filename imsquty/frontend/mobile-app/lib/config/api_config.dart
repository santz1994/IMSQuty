// lib/config/api_config.dart

class ApiConfig {
  // API Base URL
  static const String baseUrl = 'http://localhost:8000/api/v1';

  // Auth Endpoints
  static const String authLogin = '/auth/login';
  static const String authLogout = '/auth/logout';
  static const String authMe = '/auth/me';
  static const String authRefresh = '/auth/refresh';

  // Asset Endpoints
  static const String assets = '/assets';
  static const String assetDetail = '/assets';
  static const String assetCreate = '/assets';
  static const String assetUpdate = '/assets';
  static const String assetDelete = '/assets';

  // Ticket Endpoints
  static const String tickets = '/tickets';
  static const String ticketDetail = '/tickets';
  static const String ticketCreate = '/tickets';
  static const String ticketUpdate = '/tickets';
  static const String ticketDelete = '/tickets';

  // Master Data Endpoints
  static const String divisions = '/master-data/divisions';
  static const String locations = '/master-data/locations';
  static const String manufacturers = '/master-data/manufacturers';
  static const String assetTypes = '/master-data/asset-types';
  static const String warrantyTypes = '/master-data/warranty-types';
  static const String ticketPriorities = '/master-data/ticket-priorities';
  static const String ticketStatuses = '/master-data/ticket-statuses';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration sendTimeout = Duration(seconds: 30);

  // Pagination
  static const int defaultPageSize = 20;
  static const List<int> pageSizeOptions = [10, 20, 50, 100];
}
