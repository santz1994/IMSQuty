/**
 * Base Repository Pattern
 * Abstracts data access and provides caching, state management
 */

import { ServiceResponse } from '../services/BaseService'

export interface RepositoryOptions {
  cacheEnabled?: boolean
  cacheDuration?: number // in milliseconds
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * Base Repository Abstract Class
 * Handles data caching and state management
 */
export abstract class BaseRepository<T> {
  protected cache: Map<string, CacheEntry<any>> = new Map()
  protected options: RepositoryOptions

  constructor(options: RepositoryOptions = {}) {
    this.options = {
      cacheEnabled: options.cacheEnabled ?? true,
      cacheDuration: options.cacheDuration ?? 5 * 60 * 1000, // 5 minutes default
    }
  }

  /**
   * Get data from cache if available and not expired
   */
  protected getFromCache<R>(key: string): R | null {
    if (!this.options.cacheEnabled) return null

    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    const isExpired = now - entry.timestamp > (this.options.cacheDuration || 0)

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as R
  }

  /**
   * Store data in cache
   */
  protected setCache(key: string, data: any, customDuration?: number): void {
    if (!this.options.cacheEnabled) return

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear specific cache entry
   */
  protected clearCache(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  protected clearAllCache(): void {
    this.cache.clear()
  }

  /**
   * Invalidate cache entries matching pattern
   */
  protected invalidateCachePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    Array.from(this.cache.keys()).forEach((key) => {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    })
  }

  /**
   * Extract data from ServiceResponse
   */
  protected extractData<R>(response: ServiceResponse<R>): R | null {
    if (!response.success || !response.data) {
      return null
    }
    return response.data
  }

  /**
   * Extract error message from ServiceResponse
   */
  protected extractError(response: ServiceResponse<any>): string {
    return response.message || 'An error occurred'
  }

  /**
   * Check if response is successful
   */
  protected isSuccess(response: ServiceResponse<any>): boolean {
    return response.success === true
  }
}

/**
 * CRUD Repository Base Class
 * Provides standard repository operations with caching
 */
export abstract class CRUDRepository<T> extends BaseRepository<T> {
  /**
   * Get all items (with caching)
   */
  abstract getAll(params?: any): Promise<T[] | null>

  /**
   * Get single item by ID (with caching)
   */
  abstract getById(id: number | string): Promise<T | null>

  /**
   * Create new item (invalidates list cache)
   */
  abstract create(data: Partial<T>): Promise<T | null>

  /**
   * Update item (invalidates cache)
   */
  abstract update(id: number | string, data: Partial<T>): Promise<T | null>

  /**
   * Delete item (invalidates cache)
   */
  abstract delete(id: number | string): Promise<boolean>

  /**
   * Refresh cache for specific item
   */
  async refreshCache(id: number | string): Promise<void> {
    this.clearCache(`item_${id}`)
    await this.getById(id)
  }

  /**
   * Refresh list cache
   */
  async refreshListCache(): Promise<void> {
    this.clearCache('list')
    await this.getAll()
  }
}

export default BaseRepository
