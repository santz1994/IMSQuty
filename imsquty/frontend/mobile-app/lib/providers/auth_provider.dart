import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/models/user_model.dart';
import 'package:imsquty_mobile/services/auth_service.dart';
import 'package:imsquty_mobile/services/storage_service.dart';
import 'package:imsquty_mobile/utils/logger.dart';

/// Auth State - Represents current authentication state
class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final User? user;
  final String? error;
  final String? token;

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
    this.token,
  });

  /// Create copy with modifications
  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    User? user,
    String? error,
    String? token,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      error: error,
      token: token ?? this.token,
    );
  }

  @override
  String toString() =>
      'AuthState(isLoading: $isLoading, isAuthenticated: $isAuthenticated, '
      'user: ${user?.email}, hasError: ${error != null})';
}

/// Auth Notifier - Manages authentication state and operations
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final StorageService _storageService;

  AuthNotifier(this._authService, this._storageService)
    : super(const AuthState());

  /// Initialize authentication - check stored token on app launch
  Future<void> initialize() async {
    try {
      AppLogger.info('Initializing auth state');
      state = state.copyWith(isLoading: true, error: null);

      final isAuthenticated = await _authService.isAuthenticated();

      if (isAuthenticated) {
        final token = await _authService.getToken();
        AppLogger.info('Valid token found, user is authenticated');
        state = state.copyWith(
          isAuthenticated: true,
          token: token,
          isLoading: false,
        );
      } else {
        AppLogger.info('No valid token found');
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      AppLogger.error('Auth initialization failed', error: e);
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to initialize authentication',
      );
    }
  }

  /// Login with email and password
  Future<void> login({required String email, required String password}) async {
    try {
      AppLogger.info('Attempting login for: $email');
      state = state.copyWith(isLoading: true, error: null);

      final loginResponse = await _authService.login(
        email: email,
        password: password,
      );

      // Update state with user and token
      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: loginResponse.user,
        token: loginResponse.token,
      );

      AppLogger.info('Login successful');
    } catch (e) {
      AppLogger.error('Login failed', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Register new account
  Future<void> register({
    required String name,
    required String email,
    required String password,
    required String passwordConfirmation,
  }) async {
    try {
      AppLogger.info('Attempting registration');
      state = state.copyWith(isLoading: true, error: null);

      final loginResponse = await _authService.register(
        name: name,
        email: email,
        password: password,
        passwordConfirmation: passwordConfirmation,
      );

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: loginResponse.user,
        token: loginResponse.token,
      );

      AppLogger.info('Registration successful');
    } catch (e) {
      AppLogger.error('Registration failed', error: e);
      state = state.copyWith(isLoading: false, error: _extractErrorMessage(e));
      rethrow;
    }
  }

  /// Logout - clear auth state and stored data
  Future<void> logout() async {
    try {
      AppLogger.info('Logging out');
      state = state.copyWith(isLoading: true, error: null);

      await _authService.logout();

      state = const AuthState();
      AppLogger.info('Logout successful');
    } catch (e) {
      AppLogger.error('Logout failed', error: e);
      // Clear state anyway to ensure user is logged out
      state = state.copyWith(
        isLoading: false,
        error: 'Logout completed with errors',
      );
    }
  }

  /// Refresh authentication token
  Future<void> refreshToken() async {
    try {
      AppLogger.info('Refreshing auth token');

      final newToken = await _authService.refreshToken();

      state = state.copyWith(token: newToken);
      AppLogger.info('Token refreshed successfully');
    } catch (e) {
      AppLogger.error('Token refresh failed', error: e);
      // On refresh failure, force logout
      await logout();
      rethrow;
    }
  }

  /// Clear error message
  void clearError() {
    state = state.copyWith(error: null);
  }

  /// Clear all auth state (for testing or forced logout)
  Future<void> clearAuth() async {
    await _authService.clearAuth();
    state = const AuthState();
  }

  /// Verify current session is valid
  Future<bool> verifySession() async {
    try {
      return await _authService.verifySession();
    } catch (e) {
      AppLogger.error('Session verification failed', error: e);
      return false;
    }
  }

  /// Handle 401 unauthorized - force logout and clear auth
  Future<void> handleUnauthorized() async {
    AppLogger.warning('Unauthorized access - forcing logout');
    await logout();
  }

  /// Extract user-friendly error message
  String _extractErrorMessage(dynamic error) {
    if (error is Exception) {
      return error.toString().replaceFirst('Exception: ', '');
    }
    return 'An error occurred. Please try again.';
  }
}

/// Riverpod Providers

/// Auth service singleton provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

/// Storage service singleton provider
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

/// Auth state provider with StateNotifier
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  final storageService = ref.watch(storageServiceProvider);
  return AuthNotifier(authService, storageService);
});

/// Computed: Is user authenticated
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});

/// Computed: Current user
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

/// Computed: Current user ID
final currentUserIdProvider = Provider<int?>((ref) {
  return ref.watch(authProvider).user?.id;
});

/// Computed: Is loading
final isLoadingProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isLoading;
});

/// Computed: Current error
final authErrorProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).error;
});

/// Computed: Current token
final currentTokenProvider = Provider<String?>((ref) {
  return ref.watch(authProvider).token;
});

/// Initialize auth on app startup
final initializeAuthProvider = FutureProvider<void>((ref) async {
  final authNotifier = ref.read(authProvider.notifier);
  await authNotifier.initialize();
});
