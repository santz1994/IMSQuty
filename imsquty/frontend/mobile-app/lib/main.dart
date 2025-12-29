// lib/main.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:imsquty_mobile/services/api_service.dart';
import 'package:imsquty_mobile/services/connectivity_service.dart';
import 'package:imsquty_mobile/services/firebase_messaging_service.dart';
import 'package:imsquty_mobile/services/local_storage_service.dart';
import 'package:imsquty_mobile/services/notification_service.dart';
import 'package:imsquty_mobile/services/storage_service.dart';

import 'config/app_routes.dart';
import 'config/app_theme.dart';

void main() async {
  // Ensure Flutter bindings initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  ApiService().initialize();
  StorageService().initialize();

  // Initialize Firebase Cloud Messaging
  try {
    await NotificationService().initialize();
  } catch (e) {
    // FCM initialization failed (e.g., emulator), continue anyway
    print('FCM initialization failed: $e');
  }

  // Initialize Firebase Messaging for push notifications
  try {
    await firebaseMessagingService.initialize();
  } catch (e) {
    print('Firebase Messaging initialization failed: $e');
  }

  // Initialize offline support (Hive local storage)
  try {
    await localStorageService.initialize();
  } catch (e) {
    print('Local storage initialization failed: $e');
  }

  // Initialize connectivity monitoring
  try {
    await connectivityService.initialize();
  } catch (e) {
    print('Connectivity service initialization failed: $e');
  }

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'IMSQuty Mobile',
      theme: AppTheme.lightTheme(),
      darkTheme: AppTheme.darkTheme(),
      themeMode: ThemeMode.light,
      routerConfig: appRoutes,
      debugShowCheckedModeBanner: false,
    );
  }
}
