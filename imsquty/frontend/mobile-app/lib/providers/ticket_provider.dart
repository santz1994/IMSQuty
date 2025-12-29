import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/config/api_config.dart';
import 'package:imsquty_mobile/exceptions/api_exception.dart';
import 'package:imsquty_mobile/models/ticket_model.dart';
import 'package:imsquty_mobile/services/ticket_api_service.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Ticket List State - Represents paginated ticket list
class TicketListState {
  final List<Ticket> tickets;
  final bool isLoading;
  final String? error;
  final int currentPage;
  final int totalPages;
  final int total;
  final String? searchQuery;
  final String? statusFilter;
  final String? priorityFilter;
  final String? assignedToFilter;

  const TicketListState({
    this.tickets = const [],
    this.isLoading = false,
    this.error,
    this.currentPage = 1,
    this.totalPages = 1,
    this.total = 0,
    this.searchQuery,
    this.statusFilter,
    this.priorityFilter,
    this.assignedToFilter,
  });

  /// Create copy with modifications
  TicketListState copyWith({
    List<Ticket>? tickets,
    bool? isLoading,
    String? error,
    int? currentPage,
    int? totalPages,
    int? total,
    String? searchQuery,
    String? statusFilter,
    String? priorityFilter,
    String? assignedToFilter,
  }) {
    return TicketListState(
      tickets: tickets ?? this.tickets,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      total: total ?? this.total,
      searchQuery: searchQuery ?? this.searchQuery,
      statusFilter: statusFilter ?? this.statusFilter,
      priorityFilter: priorityFilter ?? this.priorityFilter,
      assignedToFilter: assignedToFilter ?? this.assignedToFilter,
    );
  }

  /// Check if has next page
  bool get hasNextPage => currentPage < totalPages;

  /// Check if has previous page
  bool get hasPreviousPage => currentPage > 1;
}

/// Ticket Detail State
class TicketDetailState {
  final Ticket? ticket;
  final bool isLoading;
  final String? error;

  const TicketDetailState({this.ticket, this.isLoading = false, this.error});

  TicketDetailState copyWith({Ticket? ticket, bool? isLoading, String? error}) {
    return TicketDetailState(
      ticket: ticket ?? this.ticket,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

/// Ticket List Notifier
class TicketListNotifier extends StateNotifier<TicketListState> {
  final TicketApiService _ticketApiService;

  TicketListNotifier(this._ticketApiService) : super(const TicketListState());

  /// Fetch tickets for current page with filters
  Future<void> fetchTickets({
    int? page,
    String? search,
    String? status,
    String? priority,
    String? assignedTo,
  }) async {
    try {
      final pageNum = page ?? state.currentPage;
      AppLogger.info('Fetching tickets - page: $pageNum');

      state = state.copyWith(
        isLoading: true,
        error: null,
        searchQuery: search ?? state.searchQuery,
        statusFilter: status ?? state.statusFilter,
        priorityFilter: priority ?? state.priorityFilter,
        assignedToFilter: assignedTo ?? state.assignedToFilter,
      );

      final ticketList = await _ticketApiService.getTickets(
        page: pageNum,
        perPage: ApiConfig.defaultPageSize,
        search: search,
        status: status,
        priority: priority,
        assignedTo: assignedTo,
      );

      state = state.copyWith(
        tickets: ticketList.data,
        currentPage: ticketList.meta.currentPage,
        totalPages: ticketList.meta.lastPage,
        total: ticketList.meta.total,
        isLoading: false,
      );

      AppLogger.info('Fetched ${ticketList.data.length} tickets');
    } catch (e) {
      AppLogger.error('Failed to fetch tickets', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
    }
  }

  /// Fetch user's assigned tickets
  Future<void> fetchMyTickets({int? page}) async {
    try {
      final pageNum = page ?? state.currentPage;
      AppLogger.info('Fetching my tickets - page: $pageNum');

      state = state.copyWith(isLoading: true, error: null);

      final ticketList = await _ticketApiService.getMyTickets(page: pageNum);

      state = state.copyWith(
        tickets: ticketList.data,
        currentPage: ticketList.meta.currentPage,
        totalPages: ticketList.meta.lastPage,
        total: ticketList.meta.total,
        isLoading: false,
      );

      AppLogger.info('Fetched ${ticketList.data.length} of my tickets');
    } catch (e) {
      AppLogger.error('Failed to fetch my tickets', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
    }
  }

  /// Go to next page
  Future<void> nextPage() async {
    if (state.hasNextPage) {
      await fetchTickets(page: state.currentPage + 1);
    }
  }

  /// Go to previous page
  Future<void> previousPage() async {
    if (state.hasPreviousPage) {
      await fetchTickets(page: state.currentPage - 1);
    }
  }

  /// Go to specific page
  Future<void> goToPage(int page) async {
    if (page > 0 && page <= state.totalPages) {
      await fetchTickets(page: page);
    }
  }

  /// Search tickets
  Future<void> search(String query) async {
    await fetchTickets(page: 1, search: query.isEmpty ? null : query);
  }

  /// Filter by status
  Future<void> filterByStatus(String? status) async {
    await fetchTickets(page: 1, status: status);
  }

  /// Filter by priority
  Future<void> filterByPriority(String? priority) async {
    await fetchTickets(page: 1, priority: priority);
  }

  /// Filter by assignee
  Future<void> filterByAssignee(String? assignedTo) async {
    await fetchTickets(page: 1, assignedTo: assignedTo);
  }

  /// Clear all filters and search
  Future<void> clearFilters() async {
    await fetchTickets(page: 1);
  }

  /// Refresh current page
  Future<void> refresh() async {
    await fetchTickets(
      page: state.currentPage,
      search: state.searchQuery,
      status: state.statusFilter,
      priority: state.priorityFilter,
      assignedTo: state.assignedToFilter,
    );
  }

  /// Create new ticket
  Future<Ticket> createTicket(Map<String, dynamic> ticketData) async {
    try {
      AppLogger.info('Creating new ticket');
      state = state.copyWith(isLoading: true, error: null);

      final ticket = await _ticketApiService.createTicket(ticketData);

      // Refresh list to include new ticket
      await refresh();

      return ticket;
    } catch (e) {
      AppLogger.error('Failed to create ticket', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Delete ticket
  Future<void> deleteTicket(int id) async {
    try {
      AppLogger.info('Deleting ticket: $id');

      await _ticketApiService.deleteTicket(id);

      // Remove from list
      state = state.copyWith(
        tickets: state.tickets.where((t) => t.id != id).toList(),
      );

      AppLogger.info('Ticket deleted');
    } catch (e) {
      AppLogger.error('Failed to delete ticket', error: e);
      state = state.copyWith(error: _extractErrorMessage(e));
      rethrow;
    }
  }

  String _extractErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'Failed to fetch tickets. Please try again.';
  }
}

/// Ticket Detail Notifier
class TicketDetailNotifier extends StateNotifier<TicketDetailState> {
  final TicketApiService _ticketApiService;

  TicketDetailNotifier(this._ticketApiService)
    : super(const TicketDetailState());

  /// Fetch ticket details by ID
  Future<void> fetchTicket(int id) async {
    try {
      AppLogger.info('Fetching ticket details: $id');
      state = state.copyWith(isLoading: true, error: null);

      final ticket = await _ticketApiService.getTicket(id);

      state = state.copyWith(ticket: ticket, isLoading: false);

      AppLogger.info('Ticket details loaded');
    } catch (e) {
      AppLogger.error('Failed to fetch ticket', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
    }
  }

  /// Update ticket
  Future<Ticket> updateTicket(int id, Map<String, dynamic> ticketData) async {
    try {
      AppLogger.info('Updating ticket: $id');
      state = state.copyWith(isLoading: true, error: null);

      final updatedTicket = await _ticketApiService.updateTicket(
        id,
        ticketData,
      );

      state = state.copyWith(ticket: updatedTicket, isLoading: false);

      return updatedTicket;
    } catch (e) {
      AppLogger.error('Failed to update ticket', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Update ticket status
  Future<void> updateStatus(int id, String status) async {
    try {
      AppLogger.info('Updating ticket status: $id -> $status');

      await _ticketApiService.updateTicketStatus(id, status);

      // Refresh ticket data
      await fetchTicket(id);
    } catch (e) {
      AppLogger.error('Failed to update status', error: e);
      rethrow;
    }
  }

  /// Update ticket priority
  Future<void> updatePriority(int id, String priority) async {
    try {
      AppLogger.info('Updating ticket priority: $id -> $priority');

      await _ticketApiService.updateTicketPriority(id, priority);

      // Refresh ticket data
      await fetchTicket(id);
    } catch (e) {
      AppLogger.error('Failed to update priority', error: e);
      rethrow;
    }
  }

  /// Assign ticket to user
  Future<void> assignTicket(int id, int userId) async {
    try {
      AppLogger.info('Assigning ticket $id to user $userId');

      await _ticketApiService.assignTicket(id, userId);

      // Refresh ticket data
      await fetchTicket(id);
    } catch (e) {
      AppLogger.error('Failed to assign ticket', error: e);
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

/// Ticket API service provider
final ticketApiServiceProvider = Provider<TicketApiService>((ref) {
  return TicketApiService();
});

/// Ticket list provider
final ticketListProvider =
    StateNotifierProvider<TicketListNotifier, TicketListState>((ref) {
      final ticketApiService = ref.watch(ticketApiServiceProvider);
      return TicketListNotifier(ticketApiService);
    });

/// Ticket detail provider with ID parameter
final ticketDetailProvider =
    StateNotifierProvider.family<TicketDetailNotifier, TicketDetailState, int>((
      ref,
      ticketId,
    ) {
      final ticketApiService = ref.watch(ticketApiServiceProvider);
      final notifier = TicketDetailNotifier(ticketApiService);
      // Auto-fetch on creation
      notifier.fetchTicket(ticketId);
      return notifier;
    });

/// Computed: Total ticket count
final ticketCountProvider = Provider<int>((ref) {
  return ref.watch(ticketListProvider).total;
});

/// Computed: Tickets per page
final ticketsPerPageProvider = Provider<int>((ref) {
  return ApiConfig.defaultPageSize;
});

/// Computed: Ticket pagination info
final ticketPaginationProvider = Provider<Map<String, dynamic>>((ref) {
  final state = ref.watch(ticketListProvider);
  return {
    'currentPage': state.currentPage,
    'totalPages': state.totalPages,
    'total': state.total,
    'hasNextPage': state.hasNextPage,
    'hasPreviousPage': state.hasPreviousPage,
  };
});

/// Computed: High priority ticket count
final highPriorityTicketCountProvider = Provider<int>((ref) {
  final tickets = ref.watch(ticketListProvider).tickets;
  return tickets
      .where(
        (t) =>
            t.priority.toLowerCase() == 'high' ||
            t.priority.toLowerCase() == 'critical',
      )
      .length;
});

/// Computed: Open/In Progress ticket count
final activeTicketCountProvider = Provider<int>((ref) {
  final tickets = ref.watch(ticketListProvider).tickets;
  return tickets
      .where(
        (t) =>
            t.status.toLowerCase() == 'open' ||
            t.status.toLowerCase() == 'in_progress',
      )
      .length;
});
