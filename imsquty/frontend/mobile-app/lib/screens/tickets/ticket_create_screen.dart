// lib/screens/tickets/ticket_create_screen.dart
// Ticket Create Screen with form submission
// Task 6.3 Implementation | 200+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/models/ticket_model.dart';
import 'package:imsquty_mobile/providers/ticket_provider.dart';
import 'package:imsquty_mobile/widgets/ticket_form_widget.dart';

class TicketCreateScreen extends ConsumerStatefulWidget {
  const TicketCreateScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<TicketCreateScreen> createState() => _TicketCreateScreenState();
}

class _TicketCreateScreenState extends ConsumerState<TicketCreateScreen> {
  late GlobalKey<FormState> _formKey;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _formKey = GlobalKey<FormState>();
  }

  Future<void> _submitForm(Ticket ticket) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await ref.read(ticketListProvider.notifier).createTicket(ticket);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ticket created successfully')),
        );
        context.pop();
        context.go('/home/tickets');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $error')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create New Ticket'),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: TicketFormWidget(
        formKey: _formKey,
        isSubmitting: _isSubmitting,
        onSubmit: _submitForm,
      ),
    );
  }
}
