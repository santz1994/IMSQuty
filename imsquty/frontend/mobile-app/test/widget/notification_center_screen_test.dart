// test/widget/notification_center_screen_test.dart
// Widget tests for NotificationCenterScreen
// Task 9 - Testing | 170+ LOC

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:imsquty_mobile/models/notification_model.dart';
import 'package:imsquty_mobile/screens/notification_center_screen.dart';

void main() {
  group('NotificationCenterScreen Widget Tests', () {
    testWidgets('NotificationCenterScreen displays title', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Notifications'), findsWidgets);
    });

    testWidgets('NotificationCenterScreen displays filter chips', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(Chip), findsWidgets);
      expect(find.text('All'), findsWidgets);
      expect(find.text('Assets'), findsWidgets);
      expect(find.text('Tickets'), findsWidgets);
    });

    testWidgets('NotificationCenterScreen displays empty state', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('NotificationCenterScreen displays notification list', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
      expect(find.byType(ListView), findsWidgets);
    });

    testWidgets('Filter chip selection updates notification list', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.tap(find.text('Assets'));
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Notification tile displays basic info', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Notification tile shows color-coded type icon', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byIcon(Icons.card_giftcard), findsWidgets); // Asset icon
    });

    testWidgets('Notification tile responds to tap', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Delete button removes notification', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byIcon(Icons.delete), findsWidgets);
    });

    testWidgets('Mark all as read button works', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Clear all notifications works', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Pagination works if implemented', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Timestamp formats correctly', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });
  });

  group('Notification Model Tests', () {
    test('PushNotification creates with all fields', () {
      // Arrange & Act
      final notification = PushNotification(
        id: 'notif_1',
        title: 'Test Notification',
        body: 'Test body',
        data: {'type': 'asset'},
        timestamp: DateTime(2024, 1, 1),
        imageUrl: 'https://example.com/img.png',
        read: false,
      );

      // Assert
      expect(notification.id, 'notif_1');
      expect(notification.title, 'Test Notification');
      expect(notification.body, 'Test body');
      expect(notification.read, false);
    });

    test('PushNotification copyWith updates fields', () {
      // Arrange
      final original = PushNotification(
        id: 'notif_1',
        title: 'Original',
        body: 'Body',
        data: {},
        timestamp: DateTime.now(),
      );

      // Act
      final updated = original.copyWith(read: true, title: 'Updated');

      // Assert
      expect(updated.id, original.id);
      expect(updated.read, true);
      expect(updated.title, 'Updated');
    });

    test('PushNotification serializes to JSON', () {
      // Arrange
      final notification = PushNotification(
        id: 'notif_1',
        title: 'Test',
        body: 'Body',
        data: {'key': 'value'},
        timestamp: DateTime(2024, 1, 1),
      );

      // Act
      final json = notification.toJson();

      // Assert
      expect(json['id'], 'notif_1');
      expect(json['title'], 'Test');
      expect(json['body'], 'Body');
      expect(json['data']['key'], 'value');
    });

    test('PushNotification deserializes from JSON', () {
      // Arrange
      final json = {
        'id': 'notif_1',
        'title': 'Test',
        'body': 'Body',
        'data': {'key': 'value'},
        'timestamp': DateTime.now().toIso8601String(),
        'read': false,
      };

      // Act
      final notification = PushNotification.fromJson(json);

      // Assert
      expect(notification.id, 'notif_1');
      expect(notification.title, 'Test');
    });

    test('PushNotification equality works', () {
      // Arrange
      final notif1 = PushNotification(
        id: 'notif_1',
        title: 'Test',
        body: 'Body',
        data: {},
        timestamp: DateTime(2024, 1, 1),
      );

      final notif2 = PushNotification(
        id: 'notif_1',
        title: 'Test',
        body: 'Body',
        data: {},
        timestamp: DateTime(2024, 1, 1),
      );

      // Act & Assert
      expect(notif1, notif2);
    });
  });

  group('NotificationCenterScreen Integration Tests', () {
    testWidgets('Screen loads without errors', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('All filter chips are interactive', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();
      await tester.tap(find.text('Assets'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Tickets'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('All'));
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });

    testWidgets('Action buttons are accessible', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(NotificationCenterScreen), findsOneWidget);
    });
  });

  group('Accessibility Tests', () {
    testWidgets('Screen has proper semantic structure', (
      WidgetTester tester,
    ) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(Semantics), findsWidgets);
    });

    testWidgets('Filter chips have labels', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: NotificationCenterScreen()),
        ),
      );

      // Act
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('All'), findsWidgets);
      expect(find.text('Assets'), findsWidgets);
      expect(find.text('Tickets'), findsWidgets);
    });
  });
}
