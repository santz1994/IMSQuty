import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/models/ticket_model.dart';
import 'package:imsquty_mobile/utils/logger.dart';
import 'api_service.dart';

/// Ticket API Service - All ticket-related API endpoints
/// Handles CRUD operations for tickets and ticket management
class TicketApiService {
  static final TicketApiService _instance = TicketApiService._internal();
  final ApiService _apiService;

  factory TicketApiService({ApiService? apiService}) {
    if (apiService != null) {
      _instance._apiService = apiService;
    }
    return _instance;
  }

  TicketApiService._internal() : _apiService = ApiService();

  /// Get paginated ticket list
  Future<TicketList> getTickets({
    int page = 1,
    int perPage = ApiConfig.defaultPageSize,
    String? status,
    String? priority,
    String? assignedTo,
    String? search,
  }) async {
    try {
      AppLogger.info('Fetching tickets - page: $page, perPage: $perPage');

      final queryParams = <String, dynamic>{
        'page': page,
        'per_page': perPage,
        if (status != null) 'status': status,
        if (priority != null) 'priority': priority,
        if (assignedTo != null) 'assigned_to': assignedTo,
        if (search != null) 'search': search,
      };

      final response = await _apiService.get<Map<String, dynamic>>(
        ApiConfig.ticketList,
        queryParameters: queryParams,
      );

      // Manual parsing since json_serializable code generation not yet run
      final tickets = TicketList(
        data: [], // TODO: Parse ticket list after code generation
        meta: PaginationMeta(
          total: response['meta']?['total'] ?? 0,
          perPage: response['meta']?['per_page'] ?? perPage,
          currentPage: response['meta']?['current_page'] ?? page,
          lastPage: response['meta']?['last_page'] ?? 1,
        ),
      );

      return tickets;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch tickets', error: e);
      throw ApiException(message: 'Failed to fetch tickets');
    }
  }

  /// Get single ticket by ID
  Future<Ticket> getTicket(int id) async {
    try {
      AppLogger.info('Fetching ticket: $id');

      final endpoint = '${ApiConfig.ticketDetail}/$id';
      final response = await _apiService.get<Map<String, dynamic>>(endpoint);

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Ticket not found');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch ticket $id', error: e);
      throw ApiException(message: 'Failed to fetch ticket details');
    }
  }

  /// Create new ticket
  Future<Ticket> createTicket(Map<String, dynamic> ticketData) async {
    try {
      AppLogger.info('Creating new ticket');

      final response = await _apiService.post<Map<String, dynamic>>(
        ApiConfig.ticketCreate,
        data: ticketData,
      );

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to create ticket', error: e);
      throw ApiException(message: 'Failed to create ticket');
    }
  }

  /// Update ticket
  Future<Ticket> updateTicket(int id, Map<String, dynamic> ticketData) async {
    try {
      AppLogger.info('Updating ticket: $id');

      final endpoint = '${ApiConfig.ticketUpdate}/$id';
      final response = await _apiService.put<Map<String, dynamic>>(
        endpoint,
        data: ticketData,
      );

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to update ticket $id', error: e);
      throw ApiException(message: 'Failed to update ticket');
    }
  }

  /// Delete ticket
  Future<void> deleteTicket(int id) async {
    try {
      AppLogger.info('Deleting ticket: $id');

      final endpoint = '${ApiConfig.ticketDelete}/$id';
      await _apiService.delete(endpoint);

      AppLogger.info('Ticket deleted: $id');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to delete ticket $id', error: e);
      throw ApiException(message: 'Failed to delete ticket');
    }
  }

  /// Update ticket status
  Future<Ticket> updateTicketStatus(int id, String status) async {
    try {
      AppLogger.info('Updating ticket $id status to: $status');

      final endpoint = '${ApiConfig.ticketUpdate}/$id';
      final response = await _apiService.put<Map<String, dynamic>>(
        endpoint,
        data: {'status': status},
      );

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to update ticket status', error: e);
      throw ApiException(message: 'Failed to update ticket status');
    }
  }

  /// Update ticket priority
  Future<Ticket> updateTicketPriority(int id, String priority) async {
    try {
      AppLogger.info('Updating ticket $id priority to: $priority');

      final endpoint = '${ApiConfig.ticketUpdate}/$id';
      final response = await _apiService.put<Map<String, dynamic>>(
        endpoint,
        data: {'priority': priority},
      );

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to update ticket priority', error: e);
      throw ApiException(message: 'Failed to update ticket priority');
    }
  }

  /// Assign ticket to user
  Future<Ticket> assignTicket(int id, int userId) async {
    try {
      AppLogger.info('Assigning ticket $id to user: $userId');

      final endpoint = '${ApiConfig.ticketUpdate}/$id';
      final response = await _apiService.put<Map<String, dynamic>>(
        endpoint,
        data: {'assigned_to': userId},
      );

      // TODO: Parse ticket after code generation
      throw ApiException(message: 'Failed to parse response');
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to assign ticket', error: e);
      throw ApiException(message: 'Failed to assign ticket');
    }
  }

  /// Get tickets by status
  Future<TicketList> getTicketsByStatus(String status, {int page = 1}) async {
    try {
      AppLogger.info('Fetching tickets with status: $status');

      final response = await _apiService.get<Map<String, dynamic>>(
        ApiConfig.ticketList,
        queryParameters: {'page': page, 'status': status},
      );

      final tickets = TicketList(
        data: [],
        meta: PaginationMeta(
          total: response['meta']?['total'] ?? 0,
          perPage: response['meta']?['per_page'] ?? 20,
          currentPage: response['meta']?['current_page'] ?? 1,
          lastPage: response['meta']?['last_page'] ?? 1,
        ),
      );

      return tickets;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch tickets by status', error: e);
      throw ApiException(message: 'Failed to fetch tickets');
    }
  }

  /// Get ticket statistics
  Future<Map<String, dynamic>> getTicketStats() async {
    try {
      AppLogger.info('Fetching ticket statistics');

      const endpoint = '${ApiConfig.ticketList}/statistics';
      return await _apiService.get<Map<String, dynamic>>(endpoint) ?? {};
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch ticket statistics', error: e);
      throw ApiException(message: 'Failed to fetch ticket statistics');
    }
  }

  /// Export tickets to CSV
  Future<String> exportTickets({String? format = 'csv'}) async {
    try {
      AppLogger.info('Exporting tickets as $format');

      const endpoint = '${ApiConfig.ticketList}/export';
      final response = await _apiService.get<String>(
        endpoint,
        queryParameters: {'format': format},
      );

      return response ?? '';
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to export tickets', error: e);
      throw ApiException(message: 'Failed to export tickets');
    }
  }

  /// Get user's assigned tickets
  Future<TicketList> getMyTickets({int page = 1}) async {
    try {
      AppLogger.info('Fetching my tickets');

      const endpoint = '${ApiConfig.ticketList}/my-tickets';
      final response = await _apiService.get<Map<String, dynamic>>(
        endpoint,
        queryParameters: {'page': page},
      );

      final tickets = TicketList(
        data: [],
        meta: PaginationMeta(
          total: response['meta']?['total'] ?? 0,
          perPage: response['meta']?['per_page'] ?? 20,
          currentPage: response['meta']?['current_page'] ?? 1,
          lastPage: response['meta']?['last_page'] ?? 1,
        ),
      );

      return tickets;
    } on ApiException {
      rethrow;
    } catch (e) {
      AppLogger.error('Failed to fetch my tickets', error: e);
      throw ApiException(message: 'Failed to fetch your tickets');
    }
  }
}
