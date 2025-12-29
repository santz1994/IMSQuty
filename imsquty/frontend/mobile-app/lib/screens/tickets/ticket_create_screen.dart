// lib/screens/tickets/ticket_create_screen.dart

import 'package:flutter/material.dart';

class TicketCreateScreen extends StatelessWidget {
  const TicketCreateScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Ticket')),
      body: const Center(child: Text('Ticket Create Screen')),
    );
  }
}
