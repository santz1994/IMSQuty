import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:imsquty_mobile/config/app_theme.dart';
import 'package:imsquty_mobile/providers/auth_provider.dart';
import 'package:imsquty_mobile/providers/master_data_provider.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Splash Screen - App initialization and auto-login
/// Displays app logo while checking authentication and loading essential data
class SplashScreen extends ConsumerWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize auth on startup
    ref.listen(initializeAuthProvider, (previous, next) {
      next.whenData((_) {
        _navigateAfterAuth(context, ref);
      }).whenError((error, _) {
        AppLogger.error('Auth initialization failed: $error');
        _navigateAfterAuth(context, ref);
      });
    });

    return Scaffold(
      backgroundColor: AppTheme.lightColorScheme.primary,
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // App Logo
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.1),
                ),
                child: Center(
                  child: Icon(
                    Icons.inventory_2_rounded,
                    size: 80,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // App Name
              Text(
                'IMSQuty',
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),

              // Tagline
              Text(
                'Inventory Management System',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 48),

              // Loading Indicator
              SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation(
                    Colors.white.withOpacity(0.8),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Loading Text
              Text(
                'Initializing...',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  /// Navigate after auth check completes
  void _navigateAfterAuth(BuildContext context, WidgetRef ref) {
    // Small delay to ensure smooth transition
    Future.delayed(const Duration(milliseconds: 500), () {
      if (!context.mounted) return;

      final authState = ref.read(authProvider);

      if (authState.isAuthenticated) {
        AppLogger.info('User authenticated, navigating to home');
        // Load master data in background
        ref.read(masterDataProvider.notifier).fetchAllMasterData();
        context.go('/home');
      } else {
        AppLogger.info('User not authenticated, navigating to login');
        context.go('/login');
      }
    });
  }
}
