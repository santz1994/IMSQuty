/**
 * Inventory Service
 * Handles inventory and stock management operations
 */

import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface InventoryItem {
  id: number
  name: string
  sku: string
  category: string
  quantity: number
  unit: string
  min_stock: number
  max_stock: number
  warehouse_id?: number
  warehouse_name?: string
  price?: number
  supplier?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  last_restock?: string
  created_at?: string
  updated_at?: string
}

export interface StockMovement {
  id: number
  item_id: number
  item_name?: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  from_warehouse?: number
  to_warehouse?: number
  reference?: string
  notes?: string
  user_id: number
  user_name?: string
  created_at: string
}

export interface CreateInventoryData {
  name: string
  sku: string
  category: string
  quantity: number
  unit: string
  min_stock: number
  max_stock?: number
  warehouse_id?: number
  price?: number
  supplier?: string
}

export interface UpdateInventoryData extends Partial<CreateInventoryData> { }

export interface CreateStockMovementData {
  item_id: number
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  from_warehouse?: number
  to_warehouse?: number
  reference?: string
  notes?: string
}

class InventoryService extends BaseService {
  constructor() {
    super('/inventory')
  }

  /**
   * Get all inventory items with pagination
   */
  async getItems(params?: PaginationParams): Promise<ServiceResponse<InventoryItem[]>> {
    try {
      const response = await this.get<InventoryItem[]>('', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single inventory item
   */
  async getItem(id: number): Promise<ServiceResponse<InventoryItem>> {
    try {
      const response = await this.get<InventoryItem>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new inventory item
   */
  async createItem(data: CreateInventoryData): Promise<ServiceResponse<InventoryItem>> {
    try {
      const response = await this.post<InventoryItem>('', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update inventory item
   */
  async updateItem(id: number, data: UpdateInventoryData): Promise<ServiceResponse<InventoryItem>> {
    try {
      const response = await this.put<InventoryItem>(`/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete inventory item
   */
  async deleteItem(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<ServiceResponse<InventoryItem[]>> {
    try {
      const response = await this.get<InventoryItem[]>('/low-stock')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems(): Promise<ServiceResponse<InventoryItem[]>> {
    try {
      const response = await this.get<InventoryItem[]>('/out-of-stock')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get stock movements
   */
  async getStockMovements(params?: PaginationParams & { item_id?: number }): Promise<ServiceResponse<StockMovement[]>> {
    try {
      const response = await this.get<StockMovement[]>('/movements', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create stock movement (restock, transfer, adjustment)
   */
  async createStockMovement(data: CreateStockMovementData): Promise<ServiceResponse<StockMovement>> {
    try {
      const response = await this.post<StockMovement>('/movements', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get inventory statistics
   */
  async getStats(): Promise<ServiceResponse<{
    total_items: number
    total_value: number
    low_stock_count: number
    out_of_stock_count: number
    categories: { name: string; count: number }[]
  }>> {
    try {
      const response = await this.get<any>('/stats')
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()
export default inventoryService

