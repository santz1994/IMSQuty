<?php

namespace App\Http\Controllers;

use App\Services\ImportExportService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Import/Export Controller
 * 
 * Handles asset import/export operations
 */
class ImportExportController extends Controller
{
    protected ImportExportService $importExportService;

    public function __construct(ImportExportService $importExportService)
    {
        $this->importExportService = $importExportService;
    }

    /**
     * Import assets from Excel file
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240' // Max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $results = $this->importExportService->importAssetsFromExcel($file);

            return response()->json([
                'success' => true,
                'message' => 'Import completed',
                'data' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export assets to Excel
     * 
     * @param Request $request
     * @return BinaryFileResponse|JsonResponse
     */
    public function exportExcel(Request $request): BinaryFileResponse|JsonResponse
    {
        try {
            $filters = $request->only(['status', 'category', 'location']);
            $filePath = $this->importExportService->exportAssetsToExcel($filters);

            return response()->download($filePath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export assets to CSV
     * 
     * @param Request $request
     * @return BinaryFileResponse|JsonResponse
     */
    public function exportCSV(Request $request): BinaryFileResponse|JsonResponse
    {
        try {
            $filters = $request->only(['status', 'category', 'location']);
            $filePath = $this->importExportService->exportAssetsToCSV($filters);

            return response()->download($filePath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download import template
     * 
     * @return BinaryFileResponse|JsonResponse
     */
    public function downloadTemplate(): BinaryFileResponse|JsonResponse
    {
        try {
            $filePath = $this->importExportService->getImportTemplate();

            return response()->download($filePath, 'asset_import_template.xlsx');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Template download failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
