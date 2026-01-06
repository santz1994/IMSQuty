import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface DataSyncEvent {
  type: 'create' | 'update' | 'delete'
  resource: 'asset' | 'ticket' | 'user'
  id: string | number
  data?: any
  timestamp: number
}

interface DataSyncContextType {
  isConnected: boolean
  subscribe: (resource: string, callback: (event: DataSyncEvent) => void) => () => void
  emit: (event: DataSyncEvent) => void
  getLastUpdate: (resource: string) => number | null
}

const DataSyncContext = createContext<DataSyncContextType | null>(null)

/**
 * Real-time Data Sync Provider
 * Enables live updates across components using event-based architecture
 * Can be easily extended to use WebSockets for true real-time sync
 */
export const DataSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscribers, setSubscribers] = useState<Map<string, Set<Function>>>(new Map())
  const [lastUpdates, setLastUpdates] = useState<Map<string, number>>(new Map())
  const [isConnected, setIsConnected] = useState(true)

  const subscribe = useCallback((resource: string, callback: (event: DataSyncEvent) => void) => {
    setSubscribers((prev) => {
      const updated = new Map(prev)
      if (!updated.has(resource)) {
        updated.set(resource, new Set())
      }
      updated.get(resource)?.add(callback)
      return updated
    })

    // Return unsubscribe function
    return () => {
      setSubscribers((prev) => {
        const updated = new Map(prev)
        updated.get(resource)?.delete(callback)
        return updated
      })
    }
  }, [])

  const emit = useCallback((event: DataSyncEvent) => {
    const resource = event.resource
    setLastUpdates((prev) => new Map(prev).set(resource, Date.now()))

    subscribers.get(resource)?.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in data sync callback:', error)
      }
    })
  }, [subscribers])

  const getLastUpdate = useCallback((resource: string) => {
    return lastUpdates.get(resource) || null
  }, [lastUpdates])

  const value: DataSyncContextType = {
    isConnected,
    subscribe,
    emit,
    getLastUpdate,
  }

  return <DataSyncContext.Provider value={value}>{children}</DataSyncContext.Provider>
}

export const useDataSync = () => {
  const context = useContext(DataSyncContext)
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider')
  }
  return context
}

/**
 * Hook for subscribing to specific resource updates
 */
export const useDataSyncListener = (
  resource: string,
  callback: (event: DataSyncEvent) => void,
) => {
  const { subscribe } = useDataSync()

  useEffect(() => {
    return subscribe(resource, callback)
  }, [resource, callback, subscribe])
}

export default DataSyncContext
