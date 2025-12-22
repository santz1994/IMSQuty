<?php

namespace App\Repositories;

use App\Models\Report;
use App\Models\ReportSchedule;

class ReportRepository
{
    public function getAll(int $perPage = 15, array $filters = [])
    {
        $query = Report::query();

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function findById(int $id): ?Report
    {
        return Report::find($id);
    }

    public function create(array $data): Report
    {
        return Report::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $report = $this->findById($id);
        return $report ? $report->update($data) : false;
    }

    public function getAllSchedules(int $perPage = 15)
    {
        return ReportSchedule::active()->paginate($perPage);
    }

    public function createSchedule(array $data): ReportSchedule
    {
        return ReportSchedule::create($data);
    }

    public function getDueSchedules()
    {
        return ReportSchedule::dueForExecution()->get();
    }

    public function updateScheduleNextRun(int $id): bool
    {
        $schedule = ReportSchedule::find($id);
        if (!$schedule) return false;

        $nextRun = match($schedule->frequency) {
            ReportSchedule::FREQUENCY_DAILY => now()->addDay(),
            ReportSchedule::FREQUENCY_WEEKLY => now()->addWeek(),
            ReportSchedule::FREQUENCY_MONTHLY => now()->addMonth(),
            ReportSchedule::FREQUENCY_QUARTERLY => now()->addMonths(3),
            ReportSchedule::FREQUENCY_YEARLY => now()->addYear(),
            default => now()->addDay()
        };

        return $schedule->update([
            'last_run_at' => now(),
            'next_run_at' => $nextRun
        ]);
    }

    public function getStatistics(): array
    {
        return [
            'total_reports' => Report::count(),
            'completed_reports' => Report::completed()->count(),
            'pending_reports' => Report::pending()->count(),
            'by_type' => Report::selectRaw('type, COUNT(*) as count')
                              ->groupBy('type')
                              ->pluck('count', 'type')
                              ->toArray(),
            'active_schedules' => ReportSchedule::active()->count()
        ];
    }
}
