/**
 * useAssets Hook
 * React hook for asset management with caching and state management
 */

import { useCallback, useEffect, useState } from 'react'
import assetRepository from '../repositories/AssetRepository'
import { Asset, AssetMovement, AssetStats, MaintenanceLog } from '../services/AssetService'
import { PaginationParams } from '../services/BaseService'

interface UseAssetsResult {
  // State
  assets: Asset[]
  loading: boolean
  error: string | null

  // Actions
  fetchAssets: (params?: PaginationParams) => Promise<void>
  getAssetById: (id: number | string) => Promise<Asset | null>
  createAsset: (data: Partial<Asset>) => Promise<Asset | null>
  updateAsset: (id: number | string, data: Partial<Asset>) => Promise<Asset | null>
  deleteAsset: (id: number | string) => Promise<boolean>
  searchAssets: (query: string, params?: PaginationParams) => Promise<void>
  refreshAssets: () => Promise<void>
}

interface UseAssetStatsResult {
  stats: AssetStats | null
  loading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  refreshStats: () => Promise<void>
}

interface UseAssetMaintenanceResult {
  maintenanceLogs: MaintenanceLog[]
  loading: boolean
  error: string | null
  fetchMaintenance: (assetId: number | string, params?: PaginationParams) => Promise<void>
  scheduleMaintenance: (assetId: number | string, data: Partial<MaintenanceLog>) => Promise<MaintenanceLog | null>
  updateMaintenance: (assetId: number | string, maintenanceId: number | string, data: Partial<MaintenanceLog>) => Promise<MaintenanceLog | null>
}

interface UseAssetMovementResult {
  movements: AssetMovement[]
  loading: boolean
  error: string | null
  fetchMovements: (assetId: number | string, params?: PaginationParams) => Promise<void>
  recordMovement: (assetId: number | string, data: Partial<AssetMovement>) => Promise<AssetMovement | null>
}

/**
 * Main hook for asset management
 */
export function useAssets(autoFetch: boolean = false, params?: PaginationParams): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetRepository.getAll(fetchParams || params)
      if (data) {
        setAssets(data)
      } else {
        setError('Failed to fetch assets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getAssetById = useCallback(async (id: number | string): Promise<Asset | null> => {
    setError(null)
    try {
      return await assetRepository.getById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [])

  const createAsset = useCallback(async (data: Partial<Asset>): Promise<Asset | null> => {
    setLoading(true)
    setError(null)
    try {
      const newAsset = await assetRepository.create(data)
      if (newAsset) {
        setAssets(prev => [newAsset, ...prev])
        return newAsset
      } else {
        setError('Failed to create asset')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAsset = useCallback(async (id: number | string, data: Partial<Asset>): Promise<Asset | null> => {
    setLoading(true)
    setError(null)
    try {
      const updatedAsset = await assetRepository.update(id, data)
      if (updatedAsset) {
        setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset))
        return updatedAsset
      } else {
        setError('Failed to update asset')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAsset = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const success = await assetRepository.delete(id)
      if (success) {
        setAssets(prev => prev.filter(asset => asset.id !== id))
        return true
      } else {
        setError('Failed to delete asset')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const searchAssets = useCallback(async (query: string, searchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetRepository.search(query, searchParams)
      if (data) {
        setAssets(data)
      } else {
        setError('Failed to search assets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshAssets = useCallback(async () => {
    await fetchAssets()
  }, [fetchAssets])

  useEffect(() => {
    if (autoFetch) {
      fetchAssets()
    }
  }, [autoFetch, fetchAssets])

  return {
    assets,
    loading,
    error,
    fetchAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    searchAssets,
    refreshAssets,
  }
}

/**
 * Hook for asset statistics
 */
export function useAssetStats(autoFetch: boolean = false): UseAssetStatsResult {
  const [stats, setStats] = useState<AssetStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetRepository.getStats()
      if (data) {
        setStats(data)
      } else {
        setError('Failed to fetch statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    const data = await assetRepository.refreshStats()
    if (data) {
      setStats(data)
    }
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }
  }, [autoFetch, fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  }
}

/**
 * Hook for asset maintenance management
 */
export function useAssetMaintenance(): UseAssetMaintenanceResult {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMaintenance = useCallback(async (assetId: number | string, params?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetRepository.getMaintenanceHistory(assetId, params)
      if (data) {
        setMaintenanceLogs(data)
      } else {
        setError('Failed to fetch maintenance logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const scheduleMaintenance = useCallback(
    async (assetId: number | string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog | null> => {
      setLoading(true)
      setError(null)
      try {
        const newLog = await assetRepository.scheduleMaintenance(assetId, data)
        if (newLog) {
          setMaintenanceLogs(prev => [newLog, ...prev])
          return newLog
        } else {
          setError('Failed to schedule maintenance')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateMaintenance = useCallback(
    async (assetId: number | string, maintenanceId: number | string, data: Partial<MaintenanceLog>): Promise<MaintenanceLog | null> => {
      setLoading(true)
      setError(null)
      try {
        // Import service directly for update operation
        const { assetService } = await import('../services/AssetService')
        const response = await assetService.updateMaintenance(assetId, maintenanceId, data)

        if (response.success && response.data) {
          setMaintenanceLogs(prev =>
            prev.map(log => (log.id === maintenanceId ? response.data! : log))
          )
          return response.data
        } else {
          setError('Failed to update maintenance')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    maintenanceLogs,
    loading,
    error,
    fetchMaintenance,
    scheduleMaintenance,
    updateMaintenance,
  }
}

/**
 * Hook for asset movement tracking
 */
export function useAssetMovement(): UseAssetMovementResult {
  const [movements, setMovements] = useState<AssetMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMovements = useCallback(async (assetId: number | string, params?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetRepository.getMovementHistory(assetId, params)
      if (data) {
        setMovements(data)
      } else {
        setError('Failed to fetch movements')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const recordMovement = useCallback(
    async (assetId: number | string, data: Partial<AssetMovement>): Promise<AssetMovement | null> => {
      setLoading(true)
      setError(null)
      try {
        const newMovement = await assetRepository.recordMovement(assetId, data)
        if (newMovement) {
          setMovements(prev => [newMovement, ...prev])
          return newMovement
        } else {
          setError('Failed to record movement')
          return null
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    movements,
    loading,
    error,
    fetchMovements,
    recordMovement,
  }
}

export default useAssets
