// lib/widgets/ticket_form_widget.dart
// Reusable Ticket Form Widget with 9 fields
// Task 6.4 Implementation | 280+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:imsquty_mobile/models/ticket_model.dart';
import 'package:imsquty_mobile/providers/asset_provider.dart';
import 'package:imsquty_mobile/utils/validators.dart';

class TicketFormWidget extends ConsumerStatefulWidget {
  final GlobalKey<FormState> formKey;
  final bool isSubmitting;
  final Function(Ticket) onSubmit;
  final Ticket? initialTicket;

  const TicketFormWidget({
    Key? key,
    required this.formKey,
    required this.isSubmitting,
    required this.onSubmit,
    this.initialTicket,
  }) : super(key: key);

  @override
  ConsumerState<TicketFormWidget> createState() => _TicketFormWidgetState();
}

class _TicketFormWidgetState extends ConsumerState<TicketFormWidget> {
  late TextEditingController _titleController;
  late TextEditingController _descriptionController;
  late TextEditingController _categoryController;
  late TextEditingController _assignedToController;
  late TextEditingController _notesController;

  late String _selectedPriority;
  late String _selectedStatus;
  late int? _selectedAssetId;
  late DateTime _dueDate;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  void _initializeControllers() {
    final ticket = widget.initialTicket;
    
    _titleController = TextEditingController(text: ticket?.title ?? '');
    _descriptionController = TextEditingController(text: ticket?.description ?? '');
    _categoryController = TextEditingController(text: ticket?.category ?? '');
    _assignedToController = TextEditingController(text: ticket?.assignedTo ?? '');
    _notesController = TextEditingController(text: ticket?.notes ?? '');

    _selectedPriority = ticket?.priority ?? 'medium';
    _selectedStatus = ticket?.status ?? 'open';
    _selectedAssetId = ticket?.assetId;
    _dueDate = ticket?.dueDate != null
        ? DateTime.parse(ticket!.dueDate!)
        : DateTime.now().add(const Duration(days: 7));
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _categoryController.dispose();
    _assignedToController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDueDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _dueDate,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );

    if (picked != null) {
      setState(() => _dueDate = picked);
    }
  }

  void _submitForm() {
    if (!widget.formKey.currentState!.validate()) {
      return;
    }

    final ticket = Ticket(
      id: widget.initialTicket?.id ?? 0,
      title: _titleController.text,
      description:
          _descriptionController.text.isEmpty ? null : _descriptionController.text,
      category: _categoryController.text.isEmpty ? null : _categoryController.text,
      priority: _selectedPriority,
      status: _selectedStatus,
      assignedTo:
          _assignedToController.text.isEmpty ? null : _assignedToController.text,
      assetId: _selectedAssetId,
      dueDate: DateFormat('yyyy-MM-dd').format(_dueDate),
      notes: _notesController.text.isEmpty ? null : _notesController.text,
      createdAt: widget.initialTicket?.createdAt ?? DateTime.now().toString(),
      updatedAt: DateTime.now().toString(),
    );

    widget.onSubmit(ticket);
  }

  @override
  Widget build(BuildContext context) {
    final assetListAsync = ref.watch(assetListProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: widget.formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Required Fields Section
            _buildSectionTitle('Required Information'),
            const SizedBox(height: 12),

            // Title Field
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                labelText: 'Ticket Title *',
                hintText: 'Brief description of the issue',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.subject),
              ),
              validator: (value) =>
                  validateRequired(value, 'Ticket title is required'),
            ),
            const SizedBox(height: 12),

            // Priority Dropdown
            DropdownButtonFormField<String>(
              value: _selectedPriority,
              decoration: InputDecoration(
                labelText: 'Priority *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.priority_high),
              ),
              items: const [
                DropdownMenuItem(value: 'low', child: Text('Low')),
                DropdownMenuItem(value: 'medium', child: Text('Medium')),
                DropdownMenuItem(value: 'high', child: Text('High')),
                DropdownMenuItem(value: 'critical', child: Text('Critical')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedPriority = value);
                }
              },
              validator: (value) =>
                  validateRequired(value, 'Priority is required'),
            ),
            const SizedBox(height: 12),

            // Status Dropdown
            DropdownButtonFormField<String>(
              value: _selectedStatus,
              decoration: InputDecoration(
                labelText: 'Status *',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.info),
              ),
              items: const [
                DropdownMenuItem(value: 'open', child: Text('Open')),
                DropdownMenuItem(value: 'in_progress', child: Text('In Progress')),
                DropdownMenuItem(value: 'resolved', child: Text('Resolved')),
                DropdownMenuItem(value: 'closed', child: Text('Closed')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedStatus = value);
                }
              },
              validator: (value) =>
                  validateRequired(value, 'Status is required'),
            ),
            const SizedBox(height: 16),

            // Details Section
            _buildSectionTitle('Details'),
            const SizedBox(height: 12),

            // Description Field
            TextFormField(
              controller: _descriptionController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Description',
                hintText: 'Detailed description of the issue...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.description),
              ),
            ),
            const SizedBox(height: 12),

            // Category Field
            TextFormField(
              controller: _categoryController,
              decoration: InputDecoration(
                labelText: 'Category',
                hintText: 'e.g., Hardware, Software, Network',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.category),
              ),
            ),
            const SizedBox(height: 16),

            // Assignment Section
            _buildSectionTitle('Assignment'),
            const SizedBox(height: 12),

            // Assigned To Field
            TextFormField(
              controller: _assignedToController,
              decoration: InputDecoration(
                labelText: 'Assigned To',
                hintText: 'Employee name',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.person),
              ),
              validator: (value) => value?.isEmpty ?? false
                  ? null
                  : validateName(value),
            ),
            const SizedBox(height: 12),

            // Related Asset Dropdown
            assetListAsync.when(
              data: (assetList) {
                return DropdownButtonFormField<int?>(
                  value: _selectedAssetId,
                  decoration: InputDecoration(
                    labelText: 'Related Asset',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    prefixIcon: const Icon(Icons.inventory_2),
                  ),
                  items: [
                    const DropdownMenuItem<int?>(
                      value: null,
                      child: Text('  No Asset  '),
                    ),
                    ...assetList.assets.map((asset) {
                      return DropdownMenuItem<int?>(
                        value: asset.id,
                        child: Text('  ${asset.name}  '),
                      );
                    }).toList(),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedAssetId = value);
                  },
                );
              },
              loading: () => const Padding(
                padding: EdgeInsets.all(8),
                child: CircularProgressIndicator(),
              ),
              error: (error, stack) => Padding(
                padding: const EdgeInsets.all(8),
                child: Text('Error loading assets'),
              ),
            ),
            const SizedBox(height: 12),

            // Due Date Picker
            InkWell(
              onTap: () => _selectDueDate(context),
              child: InputDecorator(
                decoration: InputDecoration(
                  labelText: 'Due Date',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: const Icon(Icons.calendar_today),
                ),
                child: Text(
                  DateFormat('MMM dd, yyyy').format(_dueDate),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Additional Section
            _buildSectionTitle('Additional Information'),
            const SizedBox(height: 12),

            // Notes Field
            TextFormField(
              controller: _notesController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Internal Notes',
                hintText: 'Add internal notes or observations...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.note),
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: widget.isSubmitting ? null : _submitForm,
                    icon: widget.isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.check),
                    label: Text(
                      widget.initialTicket != null ? 'Update Ticket' : 'Create Ticket',
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.isSubmitting
                        ? null
                        : () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                    label: const Text('Cancel'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
    );
  }
}
