// lib/screens/tickets/ticket_detail_screen.dart

import 'package:flutter/material.dart';

class TicketDetailScreen extends StatelessWidget {
  final int ticketId;

  const TicketDetailScreen({Key? key, required this.ticketId})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ticket Detail')),
      body: Center(child: Text('Ticket Detail Screen - ID: $ticketId')),
    );
  }
}
