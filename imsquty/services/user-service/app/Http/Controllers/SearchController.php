<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Shared\Traits\ApiResponses;

class SearchController extends Controller
{
    use ApiResponses;

    /**
     * Get trending searches
     */
    public function trending(Request $request): JsonResponse
    {
        try {
            $limit = $request->query('limit', 10);
            
            // Get trending searches from cache or generate mock data
            $trendingSearches = Cache::remember('trending_searches', 3600, function () use ($limit) {
                // Mock data for now - in production, this would come from search analytics
                return [
                    ['term' => 'Laptop', 'count' => 156, 'trend' => 'up'],
                    ['term' => 'Monitor', 'count' => 142, 'trend' => 'up'],
                    ['term' => 'Keyboard', 'count' => 128, 'trend' => 'stable'],
                    ['term' => 'Mouse', 'count' => 115, 'trend' => 'up'],
                    ['term' => 'Printer', 'count' => 98, 'trend' => 'down'],
                    ['term' => 'Scanner', 'count' => 87, 'trend' => 'stable'],
                    ['term' => 'Projector', 'count' => 76, 'trend' => 'up'],
                    ['term' => 'Webcam', 'count' => 65, 'trend' => 'up'],
                    ['term' => 'Headset', 'count' => 54, 'trend' => 'stable'],
                    ['term' => 'Speaker', 'count' => 43, 'trend' => 'down'],
                ];
            });

            // Limit results
            $trending = array_slice($trendingSearches, 0, $limit);

            return $this->successResponse($trending, 'Trending searches retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve trending searches: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get search suggestions
     */
    public function suggestions(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            
            if (strlen($query) < 2) {
                return $this->successResponse([], 'Query too short');
            }

            // Mock suggestions - in production, use Elasticsearch or similar
            $allSuggestions = [
                'Laptop Dell',
                'Laptop HP',
                'Laptop Lenovo',
                'Monitor Samsung',
                'Monitor LG',
                'Keyboard Logitech',
                'Mouse Logitech',
                'Printer Canon',
                'Printer Epson',
                'Scanner Fujitsu',
            ];

            $suggestions = array_filter($allSuggestions, function($item) use ($query) {
                return stripos($item, $query) !== false;
            });

            return $this->successResponse(array_values($suggestions), 'Suggestions retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve suggestions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Record search query for analytics
     */
    public function recordSearch(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'query' => 'required|string|max:255',
            ]);

            // In production, store this in a search_analytics table
            // For now, just return success
            
            return $this->successResponse(null, 'Search recorded successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to record search: ' . $e->getMessage(), 500);
        }
    }
}
