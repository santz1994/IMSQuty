<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * User Bulk Operations Service
 * 
 * Business logic for bulk user operations
 */
class UserBulkService
{
    public function __construct(
        private UserRepository $repository
    ) {}

    /**
     * Import users from CSV/Excel file
     * 
     * @param UploadedFile $file
     * @param bool $updateExisting
     * @return array
     */
    public function importUsers(UploadedFile $file, bool $updateExisting = false): array
    {
        $extension = $file->getClientOriginalExtension();
        $data = $extension === 'csv' ? $this->parseCsv($file) : $this->parseExcel($file);
        
        $created = 0;
        $updated = 0;
        $failed = 0;
        $errors = [];
        
        DB::beginTransaction();
        
        try {
            foreach ($data as $index => $row) {
                try {
                    // Validate required fields
                    if (empty($row['username']) || empty($row['email'])) {
                        $failed++;
                        $errors[] = "Row " . ($index + 2) . ": Missing username or email";
                        continue;
                    }
                    
                    // Check if user exists
                    $existingUser = $this->repository->findByEmail($row['email']);
                    
                    if ($existingUser) {
                        if ($updateExisting) {
                            // Update existing user
                            $updateData = array_filter([
                                'first_name' => $row['first_name'] ?? null,
                                'last_name' => $row['last_name'] ?? null,
                                'phone' => $row['phone'] ?? null,
                                'status' => $row['status'] ?? null,
                            ]);
                            
                            $existingUser->update($updateData);
                            
                            if (!empty($row['role'])) {
                                $existingUser->syncRoles([$row['role']]);
                            }
                            
                            $updated++;
                        } else {
                            $failed++;
                            $errors[] = "Row " . ($index + 2) . ": User with email {$row['email']} already exists";
                        }
                    } else {
                        // Create new user
                        $userData = [
                            'username' => $row['username'],
                            'email' => $row['email'],
                            'password' => Hash::make($row['password'] ?? 'Password123'),
                            'first_name' => $row['first_name'] ?? '',
                            'last_name' => $row['last_name'] ?? '',
                            'phone' => $row['phone'] ?? null,
                            'status' => $row['status'] ?? 'active',
                            'email_verified_at' => now(),
                        ];
                        
                        $user = User::create($userData);
                        
                        // Assign role
                        if (!empty($row['role'])) {
                            $user->assignRole($row['role']);
                        } else {
                            $user->assignRole('User');
                        }
                        
                        $created++;
                    }
                    
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }
            
            DB::commit();
            
            return [
                'created' => $created,
                'updated' => $updated,
                'failed' => $failed,
                'errors' => $errors,
                'total' => count($data)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Export users to CSV/Excel file
     * 
     * @param array $filters
     * @param string $format
     * @return string File path
     */
    public function exportUsers(array $filters, string $format = 'csv'): string
    {
        $query = User::with(['roles', 'division']);
        
        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (isset($filters['role'])) {
            $query->role($filters['role']);
        }
        
        if (isset($filters['division_id'])) {
            $query->where('division_id', $filters['division_id']);
        }
        
        $users = $query->get();
        
        if ($format === 'csv') {
            return $this->exportToCsv($users);
        } else {
            return $this->exportToExcel($users);
        }
    }

    /**
     * Get import template file
     * 
     * @param string $format
     * @return string File path
     */
    public function getImportTemplate(string $format = 'csv'): string
    {
        $headers = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'phone',
            'status',
            'role'
        ];
        
        $sampleData = [
            [
                'john_doe',
                'john@example.com',
                'Password123',
                'John',
                'Doe',
                '+1234567890',
                'active',
                'User'
            ],
            [
                'jane_smith',
                'jane@example.com',
                'Password123',
                'Jane',
                'Smith',
                '+1234567891',
                'active',
                'Manager'
            ]
        ];
        
        if ($format === 'csv') {
            $filename = 'user_import_template.csv';
            $filepath = storage_path('app/temp/' . $filename);
            
            Storage::makeDirectory('temp');
            
            $file = fopen($filepath, 'w');
            fputcsv($file, $headers);
            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
            
            return $filepath;
        }
        
        // For Excel format, use simple CSV for now
        return $this->getImportTemplate('csv');
    }

    /**
     * Bulk update users
     * 
     * @param array $userIds
     * @param array $updates
     * @return array
     */
    public function bulkUpdate(array $userIds, array $updates): array
    {
        $updated = 0;
        $failed = 0;
        
        DB::beginTransaction();
        
        try {
            foreach ($userIds as $userId) {
                try {
                    $user = $this->repository->find($userId);
                    if ($user) {
                        $user->update($updates);
                        $updated++;
                    } else {
                        $failed++;
                    }
                } catch (\Exception $e) {
                    $failed++;
                }
            }
            
            DB::commit();
            
            return [
                'updated' => $updated,
                'failed' => $failed,
                'total' => count($userIds)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk delete users
     * 
     * @param array $userIds
     * @return array
     */
    public function bulkDelete(array $userIds): array
    {
        $deleted = 0;
        $failed = 0;
        
        DB::beginTransaction();
        
        try {
            foreach ($userIds as $userId) {
                try {
                    if ($this->repository->delete($userId)) {
                        $deleted++;
                    } else {
                        $failed++;
                    }
                } catch (\Exception $e) {
                    $failed++;
                }
            }
            
            DB::commit();
            
            return [
                'deleted' => $deleted,
                'failed' => $failed,
                'total' => count($userIds)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk assign roles
     * 
     * @param array $userIds
     * @param array $roles
     * @return array
     */
    public function bulkAssignRoles(array $userIds, array $roles): array
    {
        $assigned = 0;
        $failed = 0;
        
        DB::beginTransaction();
        
        try {
            foreach ($userIds as $userId) {
                try {
                    $user = $this->repository->find($userId);
                    if ($user) {
                        $user->syncRoles($roles);
                        $assigned++;
                    } else {
                        $failed++;
                    }
                } catch (\Exception $e) {
                    $failed++;
                }
            }
            
            DB::commit();
            
            return [
                'assigned' => $assigned,
                'failed' => $failed,
                'total' => count($userIds)
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Parse CSV file
     * 
     * @param UploadedFile $file
     * @return array
     */
    private function parseCsv(UploadedFile $file): array
    {
        $data = [];
        $handle = fopen($file->getRealPath(), 'r');
        
        $headers = fgetcsv($handle);
        
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === count($headers)) {
                $data[] = array_combine($headers, $row);
            }
        }
        
        fclose($handle);
        
        return $data;
    }

    /**
     * Parse Excel file (simplified - would use PhpSpreadsheet in production)
     * 
     * @param UploadedFile $file
     * @return array
     */
    private function parseExcel(UploadedFile $file): array
    {
        // For now, treat as CSV
        // In production, use PhpSpreadsheet library
        return $this->parseCsv($file);
    }

    /**
     * Export to CSV
     * 
     * @param \Illuminate\Support\Collection $users
     * @return string File path
     */
    private function exportToCsv($users): string
    {
        $filename = 'users_export_' . now()->format('Y-m-d_His') . '.csv';
        $filepath = storage_path('app/temp/' . $filename);
        
        Storage::makeDirectory('temp');
        
        $file = fopen($filepath, 'w');
        
        // Write headers
        fputcsv($file, [
            'ID', 'Username', 'Email', 'First Name', 'Last Name', 
            'Phone', 'Status', 'Division', 'Roles', 'Created At'
        ]);
        
        // Write data
        foreach ($users as $user) {
            fputcsv($file, [
                $user->id,
                $user->username,
                $user->email,
                $user->first_name,
                $user->last_name,
                $user->phone,
                $user->status,
                $user->division?->name ?? '',
                $user->roles->pluck('name')->join(', '),
                $user->created_at->toDateTimeString()
            ]);
        }
        
        fclose($file);
        
        return $filepath;
    }

    /**
     * Export to Excel (simplified)
     * 
     * @param \Illuminate\Support\Collection $users
     * @return string File path
     */
    private function exportToExcel($users): string
    {
        // For now, export as CSV
        // In production, use PhpSpreadsheet library
        return $this->exportToCsv($users);
    }
}
