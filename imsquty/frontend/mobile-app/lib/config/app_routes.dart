// lib/config/app_routes.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/auth_provider.dart';
import '../screens/assets/asset_create_screen.dart';
import '../screens/assets/asset_detail_screen.dart';
import '../screens/assets/asset_list_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/common/error_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/tickets/ticket_create_screen.dart';
import '../screens/tickets/ticket_detail_screen.dart';
import '../screens/tickets/ticket_list_screen.dart';

/// Redirect logic for protected routes
String? _authRedirect(BuildContext context, GoRouterState state) {
  // Use a hack to access the Riverpod container
  final container = ProviderScope.containerOf(context, listen: false);
  final isAuthenticated = container.read(isAuthenticatedProvider);

  // Redirect to login if trying to access protected routes while not authenticated
  if (!isAuthenticated &&
      !state.matchedLocation.startsWith('/login') &&
      !state.matchedLocation.startsWith('/register') &&
      !state.matchedLocation.startsWith('/forgot-password') &&
      state.matchedLocation != '/') {
    return '/login';
  }

  // Redirect to home if trying to access auth routes while authenticated
  if (isAuthenticated &&
      (state.matchedLocation == '/' ||
          state.matchedLocation.startsWith('/login') ||
          state.matchedLocation.startsWith('/register') ||
          state.matchedLocation.startsWith('/forgot-password'))) {
    return '/home';
  }

  return null;
}

final GoRouter appRoutes = GoRouter(
  redirect: _authRedirect,
  errorBuilder: (context, state) => const ErrorScreen(),
  routes: [
    GoRoute(
      path: '/',
      name: 'splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      name: 'register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      name: 'forgotPassword',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
      routes: [
        // Asset Routes
        GoRoute(
          path: 'assets',
          name: 'assetList',
          builder: (context, state) => const AssetListScreen(),
          routes: [
            GoRoute(
              path: ':id',
              name: 'assetDetail',
              builder: (context, state) {
                final assetId = int.parse(state.pathParameters['id']!);
                return AssetDetailScreen(assetId: assetId);
              },
            ),
          ],
        ),
        GoRoute(
          path: 'assets/create',
          name: 'assetCreate',
          builder: (context, state) => const AssetCreateScreen(),
        ),
        // Ticket Routes
        GoRoute(
          path: 'tickets',
          name: 'ticketList',
          builder: (context, state) => const TicketListScreen(),
          routes: [
            GoRoute(
              path: ':id',
              name: 'ticketDetail',
              builder: (context, state) {
                final ticketId = int.parse(state.pathParameters['id']!);
                return TicketDetailScreen(ticketId: ticketId);
              },
            ),
          ],
        ),
        GoRoute(
          path: 'tickets/create',
          name: 'ticketCreate',
          builder: (context, state) => const TicketCreateScreen(),
        ),
      ],
    ),
  ],
);
