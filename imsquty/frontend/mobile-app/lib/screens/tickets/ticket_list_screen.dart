// lib/screens/tickets/ticket_list_screen.dart
// Ticket List Screen with pagination, search, and filters
// Task 6.1 Implementation | 290+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/models/ticket_model.dart';
import 'package:imsquty_mobile/providers/master_data_provider.dart';
import 'package:imsquty_mobile/providers/ticket_provider.dart';

class TicketListScreen extends ConsumerStatefulWidget {
  const TicketListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TicketListScreen> createState() => _TicketListScreenState();
}

class _TicketListScreenState extends ConsumerState<TicketListScreen> {
  late TextEditingController _searchController;
  String _selectedStatus = 'all';
  String _selectedPriority = 'all';
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
      ref.read(ticketListProvider.notifier).fetchTickets();
    } else {
      ref.read(ticketListProvider.notifier).search(query);
    }
  }

  void _onStatusFilterChanged(String? status) {
    if (status != null) {
      setState(() {
        _selectedStatus = status;
        _currentPage = 1;
      });
      if (status == 'all') {
        ref.read(ticketListProvider.notifier).fetchTickets();
      } else {
        ref.read(ticketListProvider.notifier).filterByStatus(status);
      }
    }
  }

  void _onPriorityFilterChanged(String? priority) {
    if (priority != null) {
      setState(() {
        _selectedPriority = priority;
        _currentPage = 1;
      });
      if (priority == 'all') {
        ref.read(ticketListProvider.notifier).fetchTickets();
      } else {
        ref.read(ticketListProvider.notifier).filterByPriority(priority);
      }
    }
  }

  void _nextPage() {
    setState(() => _currentPage++);
    ref.read(ticketListProvider.notifier).nextPage();
  }

  void _previousPage() {
    if (_currentPage > 1) {
      setState(() => _currentPage--);
      ref.read(ticketListProvider.notifier).previousPage();
    }
  }

  void _deleteTicket(int ticketId, String ticketTitle) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Ticket?'),
        content: Text('Are you sure you want to delete "$ticketTitle"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref
                  .read(ticketListProvider.notifier)
                  .deleteTicket(ticketId)
                  .then((_) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Ticket deleted successfully'),
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
    final ticketListAsync = ref.watch(ticketListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tickets'),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: ticketListAsync.when(
        data: (ticketListState) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.read(ticketListProvider.notifier).fetchTickets();
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
                            hintText: 'Search by title, description...',
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
                          ),
                        ),
                        const SizedBox(height: 12),
                        // Filter Chips
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[300]!),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: DropdownButton<String>(
                                  value: _selectedStatus,
                                  underline: const SizedBox(),
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'all',
                                      child: Text('  All Status  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'open',
                                      child: Text('  Open  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'in_progress',
                                      child: Text('  In Progress  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'resolved',
                                      child: Text('  Resolved  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'closed',
                                      child: Text('  Closed  '),
                                    ),
                                  ],
                                  onChanged: _onStatusFilterChanged,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[300]!),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: DropdownButton<String>(
                                  value: _selectedPriority,
                                  underline: const SizedBox(),
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'all',
                                      child: Text('  All Priority  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'low',
                                      child: Text('  Low  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'medium',
                                      child: Text('  Medium  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'high',
                                      child: Text('  High  '),
                                    ),
                                    DropdownMenuItem(
                                      value: 'critical',
                                      child: Text('  Critical  '),
                                    ),
                                  ],
                                  onChanged: _onPriorityFilterChanged,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Ticket List
                if (ticketListState.tickets.isEmpty)
                  SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 60),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.ticket,
                              size: 80,
                              color: Colors.grey[300],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No Tickets Found',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else
                  SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final ticket = ticketListState.tickets[index];
                      return _TicketCard(
                        ticket: ticket,
                        onTap: () => context.push('/home/tickets/${ticket.id}'),
                        onDelete: () => _deleteTicket(ticket.id, ticket.title),
                      );
                    }, childCount: ticketListState.tickets.length),
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
                          'Page $_currentPage of ${(ticketListState.total / 20).ceil()}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.chevron_right),
                          label: const Text('Next'),
                          onPressed:
                              _currentPage < (ticketListState.total / 20).ceil()
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
              const Text('Error Loading Tickets'),
              const SizedBox(height: 8),
              Text(error.toString()),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                onPressed: () => ref.refresh(ticketListProvider),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/home/tickets/create'),
        icon: const Icon(Icons.add),
        label: const Text('New Ticket'),
      ),
    );
  }
}

/// Ticket Card Widget
class _TicketCard extends StatelessWidget {
  final Ticket ticket;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _TicketCard({
    required this.ticket,
    required this.onTap,
    required this.onDelete,
  });

  Color _getStatusColor(String status) {
    switch (status) {
      case 'open':
        return Colors.blue;
      case 'in_progress':
        return Colors.orange;
      case 'resolved':
        return Colors.green;
      case 'closed':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'low':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'high':
        return Colors.red;
      case 'critical':
        return Colors.deepOrange;
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
                          ticket.title,
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'ID: ${ticket.id}',
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
                    label: Text(ticket.status.toUpperCase()),
                    backgroundColor: _getStatusColor(
                      ticket.status,
                    ).withOpacity(0.2),
                    labelStyle: TextStyle(
                      color: _getStatusColor(ticket.status),
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getPriorityColor(
                        ticket.priority,
                      ).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      ticket.priority.toUpperCase(),
                      style: TextStyle(
                        color: _getPriorityColor(ticket.priority),
                        fontWeight: FontWeight.w600,
                        fontSize: 11,
                      ),
                    ),
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
