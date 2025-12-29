// lib/widgets/asset_form_widget.dart
// Reusable Asset Form Widget with 15+ fields
// Task 5.4 Implementation | 300+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/providers/master_data_provider.dart';
import 'package:imsquty_mobile/utils/validators.dart';
import 'package:intl/intl.dart';

class AssetFormWidget extends ConsumerStatefulWidget {
  final GlobalKey<FormState> formKey;
  final bool isSubmitting;
  final Function(Asset) onSubmit;
  final Asset? initialAsset;

  const AssetFormWidget({
    Key? key,
    required this.formKey,
    required this.isSubmitting,
    required this.onSubmit,
    this.initialAsset,
  }) : super(key: key);

  @override
  ConsumerState<AssetFormWidget> createState() => _AssetFormWidgetState();
}

class _AssetFormWidgetState extends ConsumerState<AssetFormWidget> {
  late TextEditingController _nameController;
  late TextEditingController _modelController;
  late TextEditingController _serialController;
  late TextEditingController _typeController;
  late TextEditingController _categoryController;
  late TextEditingController _manufacturerController;
  late TextEditingController _locationController;
  late TextEditingController _assignedToController;
  late TextEditingController _departmentController;
  late TextEditingController _purchasePriceController;
  late TextEditingController _warrantyTypeController;
  late TextEditingController _notesController;

  late DateTime _purchaseDate;
  late DateTime _warrantyExpiry;
  late String _selectedStatus;

  @override
  void initState() {
    super.initState();
    _initializeControllers();
  }

  void _initializeControllers() {
    final asset = widget.initialAsset;

    _nameController = TextEditingController(text: asset?.name ?? '');
    _modelController = TextEditingController(text: asset?.model ?? '');
    _serialController = TextEditingController(text: asset?.serialNumber ?? '');
    _typeController = TextEditingController(text: asset?.type ?? '');
    _categoryController = TextEditingController(text: asset?.category ?? '');
    _manufacturerController = TextEditingController(
      text: asset?.manufacturer ?? '',
    );
    _locationController = TextEditingController(text: asset?.location ?? '');
    _assignedToController = TextEditingController(
      text: asset?.assignedTo ?? '',
    );
    _departmentController = TextEditingController(
      text: asset?.department ?? '',
    );
    _purchasePriceController = TextEditingController(
      text: asset?.purchasePrice?.toString() ?? '',
    );
    _warrantyTypeController = TextEditingController(
      text: asset?.warrantyType ?? '',
    );
    _notesController = TextEditingController(text: asset?.notes ?? '');

    _purchaseDate = asset?.purchaseDate != null
        ? DateTime.parse(asset!.purchaseDate!)
        : DateTime.now();
    _warrantyExpiry = asset?.warrantyExpiry != null
        ? DateTime.parse(asset!.warrantyExpiry!)
        : DateTime.now().add(const Duration(days: 365));
    _selectedStatus = asset?.status ?? 'new';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _modelController.dispose();
    _serialController.dispose();
    _typeController.dispose();
    _categoryController.dispose();
    _manufacturerController.dispose();
    _locationController.dispose();
    _assignedToController.dispose();
    _departmentController.dispose();
    _purchasePriceController.dispose();
    _warrantyTypeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context, bool isPurchaseDate) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isPurchaseDate ? _purchaseDate : _warrantyExpiry,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );

    if (picked != null) {
      setState(() {
        if (isPurchaseDate) {
          _purchaseDate = picked;
        } else {
          _warrantyExpiry = picked;
        }
      });
    }
  }

  void _submitForm() {
    if (!widget.formKey.currentState!.validate()) {
      return;
    }

    final asset = Asset(
      id: widget.initialAsset?.id ?? 0,
      name: _nameController.text,
      model: _modelController.text.isEmpty ? null : _modelController.text,
      serialNumber: _serialController.text.isEmpty
          ? null
          : _serialController.text,
      type: _typeController.text.isEmpty ? null : _typeController.text,
      category: _categoryController.text.isEmpty
          ? null
          : _categoryController.text,
      manufacturer: _manufacturerController.text.isEmpty
          ? null
          : _manufacturerController.text,
      location: _locationController.text.isEmpty
          ? null
          : _locationController.text,
      assignedTo: _assignedToController.text.isEmpty
          ? null
          : _assignedToController.text,
      department: _departmentController.text.isEmpty
          ? null
          : _departmentController.text,
      status: _selectedStatus,
      purchasePrice: _purchasePriceController.text.isEmpty
          ? null
          : double.tryParse(_purchasePriceController.text),
      purchaseDate: DateFormat('yyyy-MM-dd').format(_purchaseDate),
      warrantyType: _warrantyTypeController.text.isEmpty
          ? null
          : _warrantyTypeController.text,
      warrantyExpiry: DateFormat('yyyy-MM-dd').format(_warrantyExpiry),
      notes: _notesController.text.isEmpty ? null : _notesController.text,
      createdAt: widget.initialAsset?.createdAt ?? DateTime.now().toString(),
      updatedAt: DateTime.now().toString(),
    );

    widget.onSubmit(asset);
  }

  @override
  Widget build(BuildContext context) {
    final masterDataAsync = ref.watch(masterDataProvider);

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

            // Name Field
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Asset Name *',
                hintText: 'e.g., MacBook Pro 14"',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.label),
              ),
              validator: (value) =>
                  validateRequired(value, 'Asset name is required'),
            ),
            const SizedBox(height: 12),

            // Model Field
            TextFormField(
              controller: _modelController,
              decoration: InputDecoration(
                labelText: 'Model',
                hintText: 'e.g., Pro Max',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.build),
              ),
            ),
            const SizedBox(height: 12),

            // Serial Number Field
            TextFormField(
              controller: _serialController,
              decoration: InputDecoration(
                labelText: 'Serial Number',
                hintText: 'e.g., ABC123XYZ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.fingerprint),
              ),
              validator: (value) =>
                  value?.isEmpty ?? false ? null : validateSerialNumber(value),
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
                DropdownMenuItem(value: 'new', child: Text('New')),
                DropdownMenuItem(value: 'in_use', child: Text('In Use')),
                DropdownMenuItem(
                  value: 'maintenance',
                  child: Text('Maintenance'),
                ),
                DropdownMenuItem(value: 'retired', child: Text('Retired')),
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

            // Classification Section
            _buildSectionTitle('Classification'),
            const SizedBox(height: 12),

            // Type Field
            TextFormField(
              controller: _typeController,
              decoration: InputDecoration(
                labelText: 'Type',
                hintText: 'e.g., Laptop',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.category),
              ),
            ),
            const SizedBox(height: 12),

            // Category Field
            TextFormField(
              controller: _categoryController,
              decoration: InputDecoration(
                labelText: 'Category',
                hintText: 'e.g., Computer',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.label),
              ),
            ),
            const SizedBox(height: 12),

            // Manufacturer Field
            TextFormField(
              controller: _manufacturerController,
              decoration: InputDecoration(
                labelText: 'Manufacturer',
                hintText: 'e.g., Apple',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.factory),
              ),
              validator: (value) =>
                  value?.isEmpty ?? false ? null : validateName(value),
            ),
            const SizedBox(height: 16),

            // Location & Assignment Section
            _buildSectionTitle('Location & Assignment'),
            const SizedBox(height: 12),

            // Location Field
            TextFormField(
              controller: _locationController,
              decoration: InputDecoration(
                labelText: 'Location',
                hintText: 'e.g., Office - Desk 5',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.location_on),
              ),
            ),
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
              validator: (value) =>
                  value?.isEmpty ?? false ? null : validateName(value),
            ),
            const SizedBox(height: 12),

            // Department Field
            TextFormField(
              controller: _departmentController,
              decoration: InputDecoration(
                labelText: 'Department',
                hintText: 'e.g., IT',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.business),
              ),
            ),
            const SizedBox(height: 16),

            // Financial Section
            _buildSectionTitle('Financial Information'),
            const SizedBox(height: 12),

            // Purchase Price Field
            TextFormField(
              controller: _purchasePriceController,
              keyboardType: const TextInputType.numberWithOptions(
                decimal: true,
              ),
              decoration: InputDecoration(
                labelText: 'Purchase Price',
                hintText: '0.00',
                prefixText: '\$ ',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.attach_money),
              ),
              validator: (value) => value?.isEmpty ?? false
                  ? null
                  : double.tryParse(value!) == null
                  ? 'Invalid price format'
                  : null,
            ),
            const SizedBox(height: 12),

            // Purchase Date Picker
            InkWell(
              onTap: () => _selectDate(context, true),
              child: InputDecorator(
                decoration: InputDecoration(
                  labelText: 'Purchase Date',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: const Icon(Icons.calendar_today),
                ),
                child: Text(
                  DateFormat('MMM dd, yyyy').format(_purchaseDate),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Warranty Type Field
            TextFormField(
              controller: _warrantyTypeController,
              decoration: InputDecoration(
                labelText: 'Warranty Type',
                hintText: 'e.g., Extended Warranty',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.shield),
              ),
            ),
            const SizedBox(height: 12),

            // Warranty Expiry Date Picker
            InkWell(
              onTap: () => _selectDate(context, false),
              child: InputDecorator(
                decoration: InputDecoration(
                  labelText: 'Warranty Expiry',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  prefixIcon: const Icon(Icons.calendar_today),
                ),
                child: Text(
                  DateFormat('MMM dd, yyyy').format(_warrantyExpiry),
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Notes Section
            _buildSectionTitle('Additional Information'),
            const SizedBox(height: 12),

            // Notes Field
            TextFormField(
              controller: _notesController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Notes',
                hintText: 'Add any additional information...',
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
                      widget.initialAsset != null
                          ? 'Update Asset'
                          : 'Create Asset',
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
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
    );
  }
}
