<?php

namespace Shared\Helpers;

use Carbon\Carbon;

/**
 * DateTimeHelper
 * 
 * Provides consistent date and time formatting for Indonesian locale (Asia/Jakarta timezone)
 * Ensures all services format dates/times uniformly across the application
 * 
 * @package Shared\Helpers
 * @version 1.0.0
 */
class DateTimeHelper
{
    /**
     * Format date to Indonesian standard (DD/MM/YYYY)
     * 
     * @param string|Carbon|null $date
     * @return string
     */
    public static function formatDate($date): string
    {
        if (!$date) {
            return '';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $carbon->timezone('Asia/Jakarta')->format('d/m/Y');
    }

    /**
     * Format time to Indonesian standard with WIB suffix (HH:mm WIB)
     * 
     * @param string|Carbon|null $datetime
     * @return string
     */
    public static function formatTime($datetime): string
    {
        if (!$datetime) {
            return '';
        }

        $carbon = $datetime instanceof Carbon ? $datetime : Carbon::parse($datetime);
        return $carbon->timezone('Asia/Jakarta')->format('H:i') . ' WIB';
    }

    /**
     * Format datetime to Indonesian standard (DD/MM/YYYY HH:mm WIB)
     * 
     * @param string|Carbon|null $datetime
     * @return string
     */
    public static function formatDateTime($datetime): string
    {
        if (!$datetime) {
            return '';
        }

        $carbon = $datetime instanceof Carbon ? $datetime : Carbon::parse($datetime);
        return $carbon->timezone('Asia/Jakarta')->format('d/m/Y H:i') . ' WIB';
    }

    /**
     * Format date with day name in Indonesian (Senin, 08 Januari 2026)
     * 
     * @param string|Carbon|null $date
     * @return string
     */
    public static function formatDateWithDay($date): string
    {
        if (!$date) {
            return '';
        }

        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        $carbon->timezone('Asia/Jakarta');
        
        $dayNames = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];

        $monthNames = [
            'January' => 'Januari',
            'February' => 'Februari',
            'March' => 'Maret',
            'April' => 'April',
            'May' => 'Mei',
            'June' => 'Juni',
            'July' => 'Juli',
            'August' => 'Agustus',
            'September' => 'September',
            'October' => 'Oktober',
            'November' => 'November',
            'December' => 'Desember',
        ];

        $dayName = $dayNames[$carbon->format('l')];
        $monthName = $monthNames[$carbon->format('F')];
        
        return sprintf('%s, %02d %s %s', $dayName, $carbon->day, $monthName, $carbon->year);
    }

    /**
     * Format datetime with relative time (2 jam yang lalu)
     * 
     * @param string|Carbon|null $datetime
     * @return string
     */
    public static function formatRelative($datetime): string
    {
        if (!$datetime) {
            return '';
        }

        $carbon = $datetime instanceof Carbon ? $datetime : Carbon::parse($datetime);
        $carbon->timezone('Asia/Jakarta');
        
        $now = Carbon::now('Asia/Jakarta');
        $diffInSeconds = $now->diffInSeconds($carbon);
        
        if ($diffInSeconds < 60) {
            return 'Baru saja';
        } elseif ($diffInSeconds < 3600) {
            $minutes = floor($diffInSeconds / 60);
            return $minutes . ' menit yang lalu';
        } elseif ($diffInSeconds < 86400) {
            $hours = floor($diffInSeconds / 3600);
            return $hours . ' jam yang lalu';
        } elseif ($diffInSeconds < 604800) {
            $days = floor($diffInSeconds / 86400);
            return $days . ' hari yang lalu';
        } elseif ($diffInSeconds < 2592000) {
            $weeks = floor($diffInSeconds / 604800);
            return $weeks . ' minggu yang lalu';
        } else {
            return self::formatDate($carbon);
        }
    }

    /**
     * Get current date/time in Asia/Jakarta timezone
     * 
     * @return Carbon
     */
    public static function now(): Carbon
    {
        return Carbon::now('Asia/Jakarta');
    }

    /**
     * Get today's date at midnight in Asia/Jakarta timezone
     * 
     * @return Carbon
     */
    public static function today(): Carbon
    {
        return Carbon::today('Asia/Jakarta');
    }

    /**
     * Parse date string to Carbon with Asia/Jakarta timezone
     * 
     * @param string $date
     * @return Carbon
     */
    public static function parse(string $date): Carbon
    {
        return Carbon::parse($date, 'Asia/Jakarta');
    }

    /**
     * Format date range (08/01/2026 - 15/01/2026)
     * 
     * @param string|Carbon|null $startDate
     * @param string|Carbon|null $endDate
     * @return string
     */
    public static function formatDateRange($startDate, $endDate): string
    {
        if (!$startDate || !$endDate) {
            return '';
        }

        return self::formatDate($startDate) . ' - ' . self::formatDate($endDate);
    }

    /**
     * Format time range (09:00 - 11:00 WIB)
     * 
     * @param string|Carbon|null $startTime
     * @param string|Carbon|null $endTime
     * @return string
     */
    public static function formatTimeRange($startTime, $endTime): string
    {
        if (!$startTime || !$endTime) {
            return '';
        }

        $start = $startTime instanceof Carbon ? $startTime : Carbon::parse($startTime);
        $end = $endTime instanceof Carbon ? $endTime : Carbon::parse($endTime);
        
        return $start->timezone('Asia/Jakarta')->format('H:i') . ' - ' . 
               $end->timezone('Asia/Jakarta')->format('H:i') . ' WIB';
    }

    /**
     * Check if date is today
     * 
     * @param string|Carbon $date
     * @return bool
     */
    public static function isToday($date): bool
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $carbon->timezone('Asia/Jakarta')->isToday();
    }

    /**
     * Check if date is in the past
     * 
     * @param string|Carbon $date
     * @return bool
     */
    public static function isPast($date): bool
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $carbon->timezone('Asia/Jakarta')->isPast();
    }

    /**
     * Check if date is in the future
     * 
     * @param string|Carbon $date
     * @return bool
     */
    public static function isFuture($date): bool
    {
        $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        return $carbon->timezone('Asia/Jakarta')->isFuture();
    }

    /**
     * Get business days between two dates (excluding weekends)
     * 
     * @param string|Carbon $startDate
     * @param string|Carbon $endDate
     * @return int
     */
    public static function getBusinessDays($startDate, $endDate): int
    {
        $start = $startDate instanceof Carbon ? $startDate : Carbon::parse($startDate);
        $end = $endDate instanceof Carbon ? $endDate : Carbon::parse($endDate);
        
        $start->timezone('Asia/Jakarta');
        $end->timezone('Asia/Jakarta');
        
        $businessDays = 0;
        $current = $start->copy();
        
        while ($current->lte($end)) {
            if (!$current->isWeekend()) {
                $businessDays++;
            }
            $current->addDay();
        }
        
        return $businessDays;
    }

    /**
     * Format duration in hours and minutes (2 jam 30 menit)
     * 
     * @param int $minutes Total minutes
     * @return string
     */
    public static function formatDuration(int $minutes): string
    {
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;
        
        $result = [];
        if ($hours > 0) {
            $result[] = $hours . ' jam';
        }
        if ($mins > 0) {
            $result[] = $mins . ' menit';
        }
        
        return !empty($result) ? implode(' ', $result) : '0 menit';
    }

    /**
     * Get month name in Indonesian
     * 
     * @param int $month Month number (1-12)
     * @return string
     */
    public static function getMonthName(int $month): string
    {
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
        
        return $monthNames[$month] ?? '';
    }

    /**
     * Get day name in Indonesian
     * 
     * @param int $day Day number (0=Sunday, 6=Saturday)
     * @return string
     */
    public static function getDayName(int $day): string
    {
        $dayNames = [
            0 => 'Minggu', 1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu',
            4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu'
        ];
        
        return $dayNames[$day] ?? '';
    }
}
