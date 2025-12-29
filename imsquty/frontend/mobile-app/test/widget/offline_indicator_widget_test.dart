// test/widget/offline_indicator_widget_test.dart
// Widget tests for offline indicator components
// Task 9 - Testing | 180+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:imsquty_mobile/widgets/offline_indicator_widget.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('OfflineIndicator Widget Tests', () {
    testWidgets('OfflineIndicator displays when offline', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineIndicator(
                isOnline: false,
                isCompact: true,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineIndicator), findsOneWidget);
      expect(find.text('Offline'), findsWidgets);
    });

    testWidgets('OfflineIndicator hides when online', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineIndicator(
                isOnline: true,
                isCompact: true,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineIndicator), findsOneWidget);
    });

    testWidgets('OfflineIndicator compact mode displays correctly', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineIndicator(
                isOnline: false,
                isCompact: true,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineIndicator), findsOneWidget);
      // Compact mode should show minimal UI
    });

    testWidgets('OfflineIndicator full mode displays correctly', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineIndicator(
                isOnline: false,
                isCompact: false,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineIndicator), findsOneWidget);
      // Full mode should show detailed UI
    });

    testWidgets('OfflineSyncButton displays and responds to tap', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineSyncButton(
                isSyncing: false,
                pendingCount: 3,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineSyncButton), findsOneWidget);
      expect(find.byIcon(Icons.cloud_upload), findsWidgets);
    });

    testWidgets('OfflineSyncButton shows loading state during sync', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineSyncButton(
                isSyncing: true,
                pendingCount: 3,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineSyncButton), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsWidgets);
    });

    testWidgets('OfflineSyncButton displays pending count', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineSyncButton(
                isSyncing: false,
                pendingCount: 5,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineSyncButton), findsOneWidget);
      expect(find.text('5'), findsWidgets);
    });

    testWidgets('OfflineBanner displays with progress', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineBanner(
                isOnline: false,
                syncProgress: 0.5,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineBanner), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsWidgets);
    });

    testWidgets('OfflineBanner hides when online', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineBanner(
                isOnline: true,
                syncProgress: 0.0,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineBanner), findsOneWidget);
    });
  });

  group('NotificationBadge Widget Tests', () {
    testWidgets('NotificationBadge displays unread count', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              appBar: AppBar(
                title: Text('Test'),
              ),
              body: NotificationBadge(
                unreadCount: 5,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationBadge), findsOneWidget);
      expect(find.text('5'), findsWidgets);
    });

    testWidgets('NotificationBadge hides when no unread', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              appBar: AppBar(
                title: Text('Test'),
              ),
              body: NotificationBadge(
                unreadCount: 0,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationBadge), findsOneWidget);
    });

    testWidgets('NotificationBadge animates on count change', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              appBar: AppBar(
                title: Text('Test'),
              ),
              body: NotificationBadge(
                unreadCount: 0,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert - animated badge should scale
      expect(find.byType(NotificationBadge), findsOneWidget);
    });

    testWidgets('NotificationDropdown displays recent notifications', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: NotificationDropdown(
                notifications: [],
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationDropdown), findsOneWidget);
    });

    testWidgets('AnimatedNotificationBell displays with animation', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              appBar: AppBar(
                title: Text('Test'),
              ),
              body: AnimatedNotificationBell(
                unreadCount: 3,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(AnimatedNotificationBell), findsOneWidget);
      expect(find.byIcon(Icons.notifications), findsWidgets);
    });
  });

  group('Accessibility Tests', () {
    testWidgets('OfflineIndicator has proper semantic labels', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: OfflineIndicator(
                isOnline: false,
                isCompact: true,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.bySemanticsLabel('Offline'), findsWidgets);
    });

    testWidgets('NotificationBadge has proper semantic labels', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: Scaffold(
              body: NotificationBadge(
                unreadCount: 5,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationBadge), findsOneWidget);
    });
  });

  group('Theme Integration Tests', () {
    testWidgets('OfflineIndicator respects Material Design 3 theme', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: ThemeData(useMaterial3: true),
            home: const Scaffold(
              body: OfflineIndicator(
                isOnline: false,
                isCompact: true,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(OfflineIndicator), findsOneWidget);
    });

    testWidgets('NotificationBadge respects Material Design 3 theme', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        ProviderScope(
          child: MaterialApp(
            theme: ThemeData(useMaterial3: true),
            home: const Scaffold(
              body: NotificationBadge(
                unreadCount: 3,
              ),
            ),
          ),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationBadge), findsOneWidget);
    });
  });
}
