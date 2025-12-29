// lib/screens/assets/asset_create_screen.dart
// Asset Create Screen with form submission
// Task 5.3 Implementation | 250+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/models/asset_model.dart';
import 'package:imsquty_mobile/providers/asset_provider.dart';
import 'package:imsquty_mobile/widgets/asset_form_widget.dart';

class AssetCreateScreen extends ConsumerStatefulWidget {
  const AssetCreateScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<AssetCreateScreen> createState() => _AssetCreateScreenState();
}

class _AssetCreateScreenState extends ConsumerState<AssetCreateScreen> {
  late GlobalKey<FormState> _formKey;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _formKey = GlobalKey<FormState>();
  }

  Future<void> _submitForm(Asset asset) async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await ref.read(assetListProvider.notifier).createAsset(asset);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Asset created successfully')),
        );
        context.pop();
        // Navigate back to assets list
        context.go('/home/assets');
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error: $error')));
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
        title: const Text('Create New Asset'),
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      body: AssetFormWidget(
        formKey: _formKey,
        isSubmitting: _isSubmitting,
        onSubmit: _submitForm,
      ),
    );
  }
}
