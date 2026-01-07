<?php

namespace App\Http\Controllers;

use App\Services\UserBulkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * User Bulk Operations Controller
 * 
 * Handles bulk operations like import/export
 */
class UserBulkController extends Controller
{
    use ApiResponses;

    public function __construct(
        private UserBulkService $bulkService
    ) {}

    /**
     * Import users from CSV/Excel file
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
            'update_existing' => 'nullable|boolean'
        ]);
        
        try {
            $result = $this->bulkService->importUsers(
                $request->file('file'),
                $request->input('update_existing', false)
            );
            
            return $this->successResponse(
                $result,
                'Users imported successfully'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Import failed: ' . $e->getMessage(),
                400
            );
        }
    }

    /**
     * Export users to CSV/Excel file
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
     */
    public function export(Request $request)
    {
        $request->validate([
            'format' => 'nullable|in:csv,xlsx',
            'filters' => 'nullable|array'
        ]);
        
        try {
            $format = $request->input('format', 'csv');
            $filters = $request->input('filters', []);
            
            $filePath = $this->bulkService->exportUsers($filters, $format);
            
            return response()->download(
                $filePath,
                'users_export_' . now()->format('Y-m-d_His') . '.' . $format,
                [
                    'Content-Type' => $format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                ]
            )->deleteFileAfterSend(true);
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Export failed: ' . $e->getMessage(),
                400
            );
        }
    }

    /**
     * Get import template file
     * 
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function template(Request $request)
    {
        $format = $request->input('format', 'csv');
        
        $filePath = $this->bulkService->getImportTemplate($format);
        
        return response()->download(
            $filePath,
            'user_import_template.' . $format,
            [
                'Content-Type' => $format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ]
        );
    }

    /**
     * Bulk update users
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
            'updates' => 'required|array'
        ]);
        
        try {
            $result = $this->bulkService->bulkUpdate(
                $request->input('user_ids'),
                $request->input('updates')
            );
            
            return $this->successResponse(
                $result,
                'Users updated successfully'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Bulk update failed: ' . $e->getMessage(),
                400
            );
        }
    }

    /**
     * Bulk delete users
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id'
        ]);
        
        try {
            $result = $this->bulkService->bulkDelete(
                $request->input('user_ids')
            );
            
            return $this->successResponse(
                $result,
                'Users deleted successfully'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Bulk delete failed: ' . $e->getMessage(),
                400
            );
        }
    }

    /**
     * Bulk assign roles
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function bulkAssignRoles(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'integer|exists:users,id',
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name'
        ]);
        
        try {
            $result = $this->bulkService->bulkAssignRoles(
                $request->input('user_ids'),
                $request->input('roles')
            );
            
            return $this->successResponse(
                $result,
                'Roles assigned successfully'
            );
            
        } catch (\Exception $e) {
            return $this->errorResponse(
                'Bulk role assignment failed: ' . $e->getMessage(),
                400
            );
        }
    }
}
