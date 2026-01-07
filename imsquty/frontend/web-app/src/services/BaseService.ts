/**
 * Base Service Class
 * Provides common functionality for all service classes
 * Implements Service Layer Pattern for business logic
 */

import type { AxiosResponse } from 'axios'
import apiClient from '../api/client'

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    page?: number
    perPage?: number
    lastPage?: number
  }
}

export interface PaginationParams {
  page?: number
  perPage?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

/**
 * Base Service Abstract Class
 * All service classes should extend this to get common functionality
 */
export abstract class BaseService {
  protected endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  /**
   * Transform API response to standard ServiceResponse format
   */
  protected transformResponse<T>(response: AxiosResponse): ServiceResponse<T> {
    return {
      success: response.data.success ?? true,
      data: response.data.data,
      message: response.data.message,
      meta: response.data.meta,
    }
  }

  /**
   * Transform API error to standard ServiceResponse format
   */
  protected transformError<T>(error: any): ServiceResponse<T> {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      errors: error.response?.data?.errors,
    }
  }

  /**
   * Generic GET request
   */
  protected async get<T>(path: string = '', params?: any): Promise<ServiceResponse<T>> {
    try {
      const response = await apiClient.get(`${this.endpoint}${path}`, { params })
      return this.transformResponse<T>(response)
    } catch (error) {
      return this.transformError<T>(error)
    }
  }

  /**
   * Generic POST request
   */
  protected async post<T>(path: string = '', data?: any): Promise<ServiceResponse<T>> {
    try {
      const response = await apiClient.post(`${this.endpoint}${path}`, data)
      return this.transformResponse<T>(response)
    } catch (error) {
      return this.transformError<T>(error)
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(path: string = '', data?: any): Promise<ServiceResponse<T>> {
    try {
      const response = await apiClient.put(`${this.endpoint}${path}`, data)
      return this.transformResponse<T>(response)
    } catch (error) {
      return this.transformError<T>(error)
    }
  }

  /**
   * Generic PATCH request
   */
  protected async patchData<T>(path: string = '', data?: any): Promise<ServiceResponse<T>> {
    try {
      const response = await apiClient.patch(`${this.endpoint}${path}`, data)
      return this.transformResponse<T>(response)
    } catch (error) {
      return this.transformError<T>(error)
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(path: string = ''): Promise<ServiceResponse<T>> {
    try {
      const response = await apiClient.delete(`${this.endpoint}${path}`)
      return this.transformResponse<T>(response)
    } catch (error) {
      return this.transformError<T>(error)
    }
  }

  /**
   * Build query string from pagination params
   */
  protected buildQueryString(params: PaginationParams): string {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.perPage) queryParams.append('per_page', params.perPage.toString())
    if (params.sortBy) queryParams.append('sort_by', params.sortBy)
    if (params.sortOrder) queryParams.append('sort_order', params.sortOrder)
    if (params.search) queryParams.append('search', params.search)

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const query = queryParams.toString()
    return query ? `?${query}` : ''
  }
}

/**
 * CRUD Service Base Class
 * Provides standard CRUD operations
 */
export abstract class CRUDService<T> extends BaseService {
  /**
   * Get all items with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<ServiceResponse<T[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<T[]>(query)
  }

  /**
   * Get single item by ID
   */
  async getById(id: number | string): Promise<ServiceResponse<T>> {
    return this.get<T>(`/${id}`)
  }

  /**
   * Create new item
   */
  async create(data: Partial<T>): Promise<ServiceResponse<T>> {
    return this.post<T>('', data)
  }

  /**
   * Update existing item
   */
  async update(id: number | string, data: Partial<T>): Promise<ServiceResponse<T>> {
    return this.put<T>(`/${id}`, data)
  }

  /**
   * Partially update existing item
   */
  async patch(id: number | string, data: Partial<T>): Promise<ServiceResponse<T>> {
    return this.patchData<T>(`/${id}`, data)
  }

  /**
   * Delete item
   */
  async remove(id: number | string): Promise<ServiceResponse<void>> {
    return this.delete<void>(`/${id}`)
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: (number | string)[]): Promise<ServiceResponse<void>> {
    return this.post<void>('/bulk-delete', { ids })
  }

  /**
   * Restore soft-deleted item
   */
  async restore(id: number | string): Promise<ServiceResponse<T>> {
    return this.post<T>(`/${id}/restore`)
  }
}

export default BaseService
