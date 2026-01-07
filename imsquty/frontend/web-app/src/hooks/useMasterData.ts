/**
 * useMasterData Hooks
 * React hooks for all master data entities
 */

import { useState, useEffect, useCallback } from 'react'
import {
  divisionRepository,
  locationRepository,
  manufacturerRepository,
  warrantyTypeRepository,
  assetTypeRepository,
  assetStatusRepository,
  assetModelRepository,
} from '../repositories/MasterDataRepositories'
import {
  Division,
  Location,
  Manufacturer,
  WarrantyType,
  AssetType,
  AssetStatus,
  AssetModel,
} from '../services/MasterDataServices'
import { PaginationParams } from '../services/BaseService'

// Generic hook interface
interface UseMasterDataResult<T> {
  items: T[]
  loading: boolean
  error: string | null
  fetchItems: (params?: PaginationParams) => Promise<void>
  getById: (id: number | string) => Promise<T | null>
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: number | string, data: Partial<T>) => Promise<T | null>
  deleteItem: (id: number | string) => Promise<boolean>
  refresh: () => Promise<void>
}

/**
 * Division Hook
 */
export function useDivisions(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<Division> & { getHierarchy: () => Promise<Division[] | null> } {
  const [items, setItems] = useState<Division[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await divisionRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch divisions')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await divisionRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<Division>) => {
    setLoading(true)
    const result = await divisionRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<Division>) => {
    setLoading(true)
    const result = await divisionRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await divisionRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const getHierarchy = useCallback(async () => {
    return await divisionRepository.getHierarchy()
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh, getHierarchy }
}

/**
 * Location Hook
 */
export function useLocations(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<Location> & { getHierarchy: () => Promise<Location[] | null>; getByType: (type: string) => Promise<Location[] | null> } {
  const [items, setItems] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await locationRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch locations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await locationRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<Location>) => {
    setLoading(true)
    const result = await locationRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<Location>) => {
    setLoading(true)
    const result = await locationRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await locationRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const getHierarchy = useCallback(async () => {
    return await locationRepository.getHierarchy()
  }, [])

  const getByType = useCallback(async (type: string) => {
    return await locationRepository.getByType(type)
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh, getHierarchy, getByType }
}

/**
 * Manufacturer Hook
 */
export function useManufacturers(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<Manufacturer> {
  const [items, setItems] = useState<Manufacturer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await manufacturerRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch manufacturers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await manufacturerRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<Manufacturer>) => {
    setLoading(true)
    const result = await manufacturerRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<Manufacturer>) => {
    setLoading(true)
    const result = await manufacturerRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await manufacturerRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh }
}

/**
 * Warranty Type Hook
 */
export function useWarrantyTypes(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<WarrantyType> & { getActive: () => Promise<WarrantyType[] | null> } {
  const [items, setItems] = useState<WarrantyType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await warrantyTypeRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch warranty types')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await warrantyTypeRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<WarrantyType>) => {
    setLoading(true)
    const result = await warrantyTypeRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<WarrantyType>) => {
    setLoading(true)
    const result = await warrantyTypeRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await warrantyTypeRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const getActive = useCallback(async () => {
    return await warrantyTypeRepository.getActive()
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh, getActive }
}

/**
 * Asset Type Hook
 */
export function useAssetTypes(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<AssetType> {
  const [items, setItems] = useState<AssetType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetTypeRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch asset types')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await assetTypeRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<AssetType>) => {
    setLoading(true)
    const result = await assetTypeRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<AssetType>) => {
    setLoading(true)
    const result = await assetTypeRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await assetTypeRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh }
}

/**
 * Asset Status Hook
 */
export function useAssetStatuses(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<AssetStatus> & { getAvailable: () => Promise<AssetStatus[] | null> } {
  const [items, setItems] = useState<AssetStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetStatusRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch asset statuses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await assetStatusRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<AssetStatus>) => {
    setLoading(true)
    const result = await assetStatusRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<AssetStatus>) => {
    setLoading(true)
    const result = await assetStatusRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await assetStatusRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const getAvailable = useCallback(async () => {
    return await assetStatusRepository.getAvailable()
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh, getAvailable }
}

/**
 * Asset Model Hook
 */
export function useAssetModels(autoFetch: boolean = false, params?: PaginationParams): UseMasterDataResult<AssetModel> {
  const [items, setItems] = useState<AssetModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await assetModelRepository.getAll(fetchParams || params)
      if (data) setItems(data)
      else setError('Failed to fetch asset models')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getById = useCallback(async (id: number | string) => {
    return await assetModelRepository.getById(id)
  }, [])

  const create = useCallback(async (data: Partial<AssetModel>) => {
    setLoading(true)
    const result = await assetModelRepository.create(data)
    if (result) setItems(prev => [result, ...prev])
    setLoading(false)
    return result
  }, [])

  const update = useCallback(async (id: number | string, data: Partial<AssetModel>) => {
    setLoading(true)
    const result = await assetModelRepository.update(id, data)
    if (result) setItems(prev => prev.map(item => item.id === id ? result : item))
    setLoading(false)
    return result
  }, [])

  const deleteItem = useCallback(async (id: number | string) => {
    setLoading(true)
    const success = await assetModelRepository.delete(id)
    if (success) setItems(prev => prev.filter(item => item.id !== id))
    setLoading(false)
    return success
  }, [])

  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) fetchItems()
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, getById, create, update, deleteItem, refresh }
}

export default {
  useDivisions,
  useLocations,
  useManufacturers,
  useWarrantyTypes,
  useAssetTypes,
  useAssetStatuses,
  useAssetModels,
}
