// lib/screens/tickets/ticket_list_screen.dart

import 'package:flutter/material.dart';

class TicketListScreen extends StatelessWidget {
  const TicketListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tickets')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.ticket, size: 80, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text('Tickets List Screen'),
            const Text('Coming Soon...', style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}
