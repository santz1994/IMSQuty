# 📱 IMSQuty Mobile App

**Flutter-based mobile application** for asset and ticket management system (iOS + Android)

## 🎯 Overview

Cross-platform mobile app built with Flutter that mirrors the web application functionality. Provides users with on-the-go asset and ticket management with offline support and push notifications.

## ✨ Features

### Core Features
- ✅ **User Authentication** - JWT-based login with secure token storage
- ✅ **Asset Management** - List, Create, Detail, Delete, Search
- ✅ **Ticket Management** - List, Create, Detail, Delete, Update Status
- ✅ **QR Code Scanning** - Quick asset lookup via QR code
- ✅ **Pagination** - Efficient data loading with page controls
- ✅ **Search & Filter** - Find assets and tickets quickly

### Advanced Features
- ✅ **Offline Support** - Work offline with local Hive database
- ✅ **Sync on Reconnect** - Automatically sync changes when online
- ✅ **Push Notifications** - Real-time alerts for new tickets and asset updates
- ✅ **Responsive UI** - Touch-optimized Material Design 3
- ✅ **Error Handling** - Comprehensive error messages and recovery
- ✅ **Loading States** - User-friendly loading indicators

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Language** | Dart |
| **Framework** | Flutter 3.16+ |
| **State Management** | Riverpod |
| **HTTP Client** | Dio |
| **Local Storage** | Hive |
| **Notifications** | Firebase Cloud Messaging |
| **Routing** | GoRouter |
| **UI Components** | Material Design 3 |
| **JSON Serialization** | json_serializable |
| **Testing** | Mocktail + Integration Testing |

## 📁 Project Structure

```
lib/
├── main.dart                 # Entry point
├── config/
│   ├── api_config.dart      # API endpoints configuration
│   ├── app_theme.dart       # Material Design 3 theme
│   └── app_routes.dart      # Navigation routes (GoRouter)
├── services/
│   ├── api_service.dart     # HTTP client with Dio
│   ├── auth_service.dart    # Authentication logic
│   ├── storage_service.dart # Local storage with Hive
│   └── notification_service.dart # Firebase push notifications
├── models/
│   ├── user_model.dart      # User data model
│   ├── asset_model.dart     # Asset data model
│   └── ticket_model.dart    # Ticket data model
├── providers/
│   ├── auth_provider.dart   # Auth state management
│   ├── asset_provider.dart  # Asset state management
│   └── ticket_provider.dart # Ticket state management
├── screens/
│   ├── auth/
│   │   ├── splash_screen.dart
│   │   ├── login_screen.dart
│   │   └── auth_middleware.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── assets/
│   │   ├── asset_list_screen.dart
│   │   ├── asset_detail_screen.dart
│   │   ├── asset_create_screen.dart
│   │   └── asset_qr_screen.dart
│   ├── tickets/
│   │   ├── ticket_list_screen.dart
│   │   ├── ticket_detail_screen.dart
│   │   └── ticket_create_screen.dart
│   └── common/
│       └── error_screen.dart
├── widgets/
│   ├── app_bar.dart
│   ├── drawer.dart
│   ├── buttons.dart
│   ├── text_fields.dart
│   ├── loading_widget.dart
│   └── error_widget.dart
├── utils/
│   ├── constants.dart       # App-wide constants
│   ├── validators.dart      # Form validation rules
│   ├── formatters.dart      # Date, currency, text formatting
│   └── logger.dart          # Logging utility
└── exceptions/
    └── api_exception.dart   # Custom exception classes
```

## 🚀 Getting Started

### Prerequisites
- Flutter 3.16+
- Dart 3.0+
- iOS 12.0+ / Android API 21+
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the project**
```bash
cd d:\Project\ITQuty\imsquty\frontend\mobile-app
```

2. **Install dependencies**
```bash
flutter pub get
```

3. **Run code generation** (for models)
```bash
dart run build_runner build
```

4. **Run on emulator/device**
```bash
flutter run
```

## 🔧 Development Commands

### Run the app
```bash
flutter run
```

### Run on specific device
```bash
flutter run -d <device-id>
flutter devices  # List available devices
```

### Generate code
```bash
dart run build_runner build      # One-time generation
dart run build_runner watch      # Watch mode
```

### Run tests
```bash
flutter test                     # Unit tests
flutter test integration_test/   # Integration tests
```

### Clean build
```bash
flutter clean
flutter pub get
dart run build_runner build
```

### Format code
```bash
dart format lib/
```

### Analyze code
```bash
dart analyze lib/
```

## 📝 API Integration

### Base URL
```
http://localhost:8000/api/v1
```

### Authentication
- JWT token stored in secure storage
- Auto-refreshed before expiry
- Token injected in all API requests

### Available Endpoints
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Current user info
- `GET /assets` - List assets (paginated)
- `POST /assets` - Create asset
- `GET /assets/{id}` - Asset detail
- `PUT /assets/{id}` - Update asset
- `DELETE /assets/{id}` - Delete asset
- `GET /tickets` - List tickets (paginated)
- `POST /tickets` - Create ticket
- `GET /tickets/{id}` - Ticket detail
- `PUT /tickets/{id}` - Update ticket
- `DELETE /tickets/{id}` - Delete ticket

## 🗄️ Local Storage

Uses **Hive** for local database:
- Cache assets and tickets for offline use
- Store user authentication tokens securely
- Persist app settings and preferences
- Queue offline changes for sync

## 📱 Screens Implemented

### Authentication
- ✅ **Splash Screen** - Show loading while checking auth
- ✅ **Login Screen** - Email/password login form
- 🔄 **Auth Middleware** - Protect routes requiring auth

### Home
- ✅ **Dashboard** - Overview with quick stats
- ✅ **Navigation Drawer** - Main menu

### Assets
- 🔄 **Asset List** - Paginated list with search/filter
- 🔄 **Asset Detail** - View/edit asset details
- 🔄 **Asset Create** - Create new asset form
- 🔄 **Asset QR** - Scan QR code for quick lookup

### Tickets
- 🔄 **Ticket List** - Paginated list with filters
- 🔄 **Ticket Detail** - View/edit ticket details
- 🔄 **Ticket Create** - Create new ticket form

Legend: ✅ Complete | 🔄 In Progress | ⚫ Pending

## 🧪 Testing

### Unit Tests
```bash
flutter test test/unit/
```

### Integration Tests
```bash
flutter test integration_test/
```

### Test Coverage
```bash
flutter test --coverage
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Secure token storage using flutter_secure_storage
- HTTPS-only API communication
- Input validation on all forms
- RBAC (Role-Based Access Control)
- Comprehensive error handling

## 📦 Dependencies

See `pubspec.yaml` for complete list of dependencies:
- **Network**: dio, http
- **State Management**: flutter_riverpod, riverpod_annotation
- **Storage**: hive, hive_flutter, flutter_secure_storage
- **Notifications**: firebase_core, firebase_messaging
- **UI**: flutter_svg, cached_network_image
- **Forms**: form_builder_flutter, form_builder_validators
- **Navigation**: go_router
- **Logging**: logger

## 🚢 Building for Production

### iOS Build
```bash
flutter build ios --release
# Output: build/ios/ipa/
```

### Android Build
```bash
flutter build apk --release
flutter build appbundle --release
# Output: build/app/outputs/
```

### App Store Submission
1. Create App Store Connect account
2. Configure app identifiers
3. Set up signing certificates
4. Submit via Xcode Organizer

### Google Play Submission
1. Create Google Play Console account
2. Configure app listing
3. Set up signing keystore
4. Submit via Android Studio or Command line

## 🐛 Debugging

### Enable debug logging
```dart
import 'utils/logger.dart';

AppLogger.debug('Debug message');
AppLogger.info('Info message');
AppLogger.warning('Warning message');
AppLogger.error('Error message', error: e, stackTrace: st);
```

### Run with verbose output
```bash
flutter run -v
```

## 📊 Performance Optimization

- Lazy loading of screens
- Image caching with cached_network_image
- Efficient pagination
- Local caching with Hive
- Code splitting for faster builds

## 🤝 Contributing

When contributing to this project:
1. Follow Dart style guide (dart format)
2. Use meaningful variable names (no generic: data, items, list, temp)
3. Add error handling for all API calls
4. Include loading states for async operations
5. Write unit tests for new features
6. Update documentation

## 📚 Resources

- [Flutter Documentation](https://flutter.dev)
- [Riverpod Documentation](https://riverpod.dev)
- [Material Design 3](https://m3.material.io)
- [Dio HTTP Client](https://pub.dev/packages/dio)
- [GoRouter](https://pub.dev/packages/go_router)

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review code examples in this project
3. Consult Flutter community resources
4. Contact development team

## 📄 License

IMSQuty Mobile - Internal Use Only

---

**Last Updated**: January 2, 2025  
**Flutter Version**: 3.16+  
**Status**: 🔴 In Development (Task 1)
