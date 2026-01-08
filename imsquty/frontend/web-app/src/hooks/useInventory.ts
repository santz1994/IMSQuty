/**
 * Inventory Hook - Custom React hook for inventory operations
 */
import { useCallback, useEffect, useState } from 'react'
import inventoryService, { CreateInventoryData, InventoryItem } from '../services/InventoryService'

export const useInventory = (autoFetch = false) => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.getItems()
      if (response.success && response.data) {
        setItems(response.data)
      } else {
        setError(response.message || 'Failed to fetch inventory')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const createItem = useCallback(async (data: CreateInventoryData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.createItem(data)
      if (response.success) {
        await fetchItems()
        return response.data
      } else {
        setError(response.message || 'Failed to create item')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchItems])

  const updateItem = useCallback(async (id: number, data: Partial<CreateInventoryData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.updateItem(id, data)
      if (response.success) {
        await fetchItems()
        return response.data
      } else {
        setError(response.message || 'Failed to update item')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchItems])

  const deleteItem = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryService.deleteItem(id)
      if (response.success) {
        await fetchItems()
        return true
      } else {
        setError(response.message || 'Failed to delete item')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchItems])

  useEffect(() => {
    if (autoFetch) {
      fetchItems()
    }
  }, [autoFetch, fetchItems])

  return { items, loading, error, fetchItems, createItem, updateItem, deleteItem }
}
