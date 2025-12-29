// lib/utils/formatters.dart

import 'package:intl/intl.dart';

class Formatters {
  // Date Formatting
  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy').format(date);
  }

  static String formatDateTime(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
  }

  static String formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }

  static String formatDateLong(DateTime date) {
    return DateFormat('EEEE, dd MMMM yyyy').format(date);
  }

  // Currency Formatting
  static String formatCurrency(double amount, {String symbol = 'Rp'}) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: symbol,
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  // Number Formatting
  static String formatNumber(int number) {
    return NumberFormat('#,##0').format(number);
  }

  static String formatDecimal(double number, {int decimals = 2}) {
    return NumberFormat('0.${'0' * decimals}').format(number);
  }

  // Status Formatting
  static String formatStatus(String status) {
    return status
        .split('_')
        .map((word) {
          return word[0].toUpperCase() + word.substring(1);
        })
        .join(' ');
  }

  // Text Formatting
  static String truncateText(String text, int length) {
    if (text.length <= length) return text;
    return '${text.substring(0, length)}...';
  }

  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }

  static String capitalizeWords(String text) {
    return text.split(' ').map((word) => capitalize(word)).join(' ');
  }
}
