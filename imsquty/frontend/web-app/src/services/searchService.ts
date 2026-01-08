import api from './api'

export interface SearchResult {
  id: string
  type: 'asset' | 'ticket' | 'user' | 'meeting-room' | 'inventory' | 'invoice'
  title: string
  description?: string
  metadata?: Record<string, any>
}

export interface SearchSuggestion {
  label: string
  category: 'asset' | 'ticket' | 'user' | 'recent' | 'trending'
  value: any
  description?: string
}

export interface TrendingSearch {
  query: string
  count: number
  label: string
  category: string
}

/**
 * Global search across all modules
 */
export const globalSearch = async (
  query: string,
  filters?: {
    types?: string[]
    limit?: number
  }
): Promise<SearchResult[]> => {
  try {
    const response = await api.get('/search', {
      params: {
        q: query,
        types: filters?.types?.join(','),
        limit: filters?.limit || 10,
      },
    })
    return response.data.data
  } catch (error) {
    console.error('Global search failed:', error)
    return []
  }
}

/**
 * Get search suggestions as user types
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10
): Promise<SearchSuggestion[]> => {
  if (!query || query.length < 2) {
    return []
  }

  try {
    const response = await api.get('/search/suggestions', {
      params: { q: query, limit },
    })

    const results = response.data.data || []

    // Transform API results to SearchSuggestion format
    return results.map((item: any) => ({
      label: item.title || item.name || item.label,
      category: mapTypeToCategory(item.type),
      value: { id: item.id, type: item.type },
      description: item.description || item.subtitle,
    }))
  } catch (error) {
    console.error('Failed to fetch search suggestions:', error)
    // Fallback to local search if API fails
    return performLocalSearch(query, limit)
  }
}

/**
 * Get trending searches across the platform
 */
export const getTrendingSearches = async (limit: number = 5): Promise<SearchSuggestion[]> => {
  try {
    const response = await api.get('/search/trending', {
      params: { limit },
    })

    const trending = response.data.data || []

    return trending.map((item: TrendingSearch) => ({
      label: item.label,
      category: 'trending' as const,
      value: { filter: item.query },
      description: `${item.count} searches`,
    }))
  } catch (error) {
    console.error('Failed to fetch trending searches:', error)
    // Return fallback trending searches
    return getFallbackTrendingSearches()
  }
}

/**
 * Search in specific module
 */
export const searchAssets = async (query: string, limit: number = 10) => {
  const response = await api.get('/assets', {
    params: { search: query, limit },
  })
  return response.data.data
}

export const searchTickets = async (query: string, limit: number = 10) => {
  const response = await api.get('/tickets', {
    params: { search: query, limit },
  })
  return response.data.data
}

export const searchUsers = async (query: string, limit: number = 10) => {
  const response = await api.get('/users', {
    params: { search: query, limit },
  })
  return response.data.data
}

export const searchMeetingRooms = async (query: string, limit: number = 10) => {
  const response = await api.get('/meeting-rooms', {
    params: { search: query, limit },
  })
  return response.data.data
}

export const searchInventory = async (query: string, limit: number = 10) => {
  const response = await api.get('/inventory', {
    params: { search: query, limit },
  })
  return response.data.data
}

/**
 * Helper functions
 */
function mapTypeToCategory(type: string): SearchSuggestion['category'] {
  const mapping: Record<string, SearchSuggestion['category']> = {
    asset: 'asset',
    ticket: 'ticket',
    user: 'user',
    'meeting-room': 'recent',
    inventory: 'recent',
  }
  return mapping[type] || 'recent'
}

/**
 * Fallback local search when API is unavailable
 */
async function performLocalSearch(query: string, limit: number): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = []

  try {
    // Search assets
    const assets = await searchAssets(query, 3)
    assets.forEach((asset: any) => {
      suggestions.push({
        label: asset.asset_tag || asset.name,
        category: 'asset',
        value: { id: asset.id, type: 'asset' },
        description: asset.asset_model?.name || 'Asset',
      })
    })

    // Search tickets
    const tickets = await searchTickets(query, 3)
    tickets.forEach((ticket: any) => {
      suggestions.push({
        label: `Ticket #${ticket.ticket_number}`,
        category: 'ticket',
        value: { id: ticket.id, type: 'ticket' },
        description: ticket.subject,
      })
    })

    // Search users
    const users = await searchUsers(query, 2)
    users.forEach((user: any) => {
      suggestions.push({
        label: user.name,
        category: 'user',
        value: { id: user.id, type: 'user' },
        description: user.email,
      })
    })

    return suggestions.slice(0, limit)
  } catch (error) {
    console.error('Local search failed:', error)
    return []
  }
}

/**
 * Fallback trending searches
 */
function getFallbackTrendingSearches(): SearchSuggestion[] {
  return [
    {
      label: 'Available Assets',
      category: 'trending',
      value: { filter: 'status:available' },
      description: 'View all available assets',
    },
    {
      label: 'Open Tickets',
      category: 'trending',
      value: { filter: 'status:open' },
      description: 'All open support tickets',
    },
    {
      label: 'Low Stock Items',
      category: 'trending',
      value: { filter: 'stock:low' },
      description: 'Items needing reorder',
    },
  ]
}

/**
 * Save search to recent history (localStorage)
 */
export const saveRecentSearch = (query: string) => {
  try {
    const recent = getRecentSearches()
    const updated = [query, ...recent.filter((s) => s !== query)].slice(0, 10)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save recent search:', error)
  }
}

/**
 * Get recent searches from localStorage
 */
export const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem('recentSearches')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

/**
 * Clear recent search history
 */
export const clearRecentSearches = () => {
  localStorage.removeItem('recentSearches')
}

const searchService = {
  globalSearch,
  getSearchSuggestions,
  getTrendingSearches,
  searchAssets,
  searchTickets,
  searchUsers,
  searchMeetingRooms,
  searchInventory,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
}

export default searchService
