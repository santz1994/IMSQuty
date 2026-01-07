/**
 * Master Data Services
 * Business logic for division, location, manufacturer, and warranty types
 */

import { CRUDService, ServiceResponse } from './BaseService'

// Division Service
export interface Division {
  id: number
  name: string
  code: string
  description?: string
  parent_id?: number
  manager_id?: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  // Relations
  parent?: Division
  children?: Division[]
  manager?: any
}

class DivisionService extends CRUDService<Division> {
  constructor() {
    super('/divisions')
  }

  /**
   * Get division hierarchy
   */
  async getHierarchy(): Promise<ServiceResponse<Division[]>> {
    return this.get<Division[]>('/hierarchy')
  }

  /**
   * Get child divisions
   */
  async getChildren(id: number | string): Promise<ServiceResponse<Division[]>> {
    return this.get<Division[]>(`/${id}/children`)
  }
}

// Location Service
export interface Location {
  id: number
  name: string
  code: string
  type: 'building' | 'floor' | 'room' | 'area'
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  parent_id?: number
  capacity?: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  // Relations
  parent?: Location
  children?: Location[]
}

class LocationService extends CRUDService<Location> {
  constructor() {
    super('/locations')
  }

  /**
   * Get location hierarchy
   */
  async getHierarchy(): Promise<ServiceResponse<Location[]>> {
    return this.get<Location[]>('/hierarchy')
  }

  /**
   * Get child locations
   */
  async getChildren(id: number | string): Promise<ServiceResponse<Location[]>> {
    return this.get<Location[]>(`/${id}/children`)
  }

  /**
   * Get locations by type
   */
  async getByType(type: string): Promise<ServiceResponse<Location[]>> {
    return this.get<Location[]>(`/type/${type}`)
  }
}

// Manufacturer Service
export interface Manufacturer {
  id: number
  name: string
  code?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  status: 'active' | 'inactive'
  notes?: string
  created_at?: string
  updated_at?: string
}

class ManufacturerService extends CRUDService<Manufacturer> {
  constructor() {
    super('/manufacturers')
  }

  /**
   * Search manufacturers by name
   */
  async searchByName(name: string): Promise<ServiceResponse<Manufacturer[]>> {
    return this.get<Manufacturer[]>(`/search?name=${name}`)
  }
}

// Warranty Type Service
export interface WarrantyType {
  id: number
  name: string
  description?: string
  duration_months: number
  coverage_type: 'full' | 'limited' | 'extended'
  terms?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

class WarrantyTypeService extends CRUDService<WarrantyType> {
  constructor() {
    super('/warranty-types')
  }

  /**
   * Get active warranty types
   */
  async getActive(): Promise<ServiceResponse<WarrantyType[]>> {
    return this.get<WarrantyType[]>('/active')
  }
}

// Asset Type Service
export interface AssetType {
  id: number
  name: string
  code: string
  category: string
  description?: string
  depreciation_rate?: number
  useful_life_months?: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

class AssetTypeService extends CRUDService<AssetType> {
  constructor() {
    super('/asset-types')
  }

  /**
   * Get types by category
   */
  async getByCategory(category: string): Promise<ServiceResponse<AssetType[]>> {
    return this.get<AssetType[]>(`/category/${category}`)
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<ServiceResponse<string[]>> {
    return this.get<string[]>('/categories')
  }
}

// Asset Status Service
export interface AssetStatus {
  id: number
  name: string
  code: string
  color?: string
  description?: string
  is_available: boolean
  order: number
  created_at?: string
  updated_at?: string
}

class AssetStatusService extends CRUDService<AssetStatus> {
  constructor() {
    super('/asset-statuses')
  }

  /**
   * Get available statuses (for checkout)
   */
  async getAvailable(): Promise<ServiceResponse<AssetStatus[]>> {
    return this.get<AssetStatus[]>('/available')
  }

  /**
   * Reorder statuses
   */
  async reorder(statusIds: number[]): Promise<ServiceResponse<{ message: string }>> {
    return this.post<{ message: string }>('/reorder', { status_ids: statusIds })
  }
}

// Asset Model Service
export interface AssetModel {
  id: number
  name: string
  model_number: string
  manufacturer_id: number
  asset_type_id: number
  description?: string
  specifications?: Record<string, any>
  image_url?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  // Relations
  manufacturer?: Manufacturer
  assetType?: AssetType
}

class AssetModelService extends CRUDService<AssetModel> {
  constructor() {
    super('/asset-models')
  }

  /**
   * Get models by manufacturer
   */
  async getByManufacturer(manufacturerId: number): Promise<ServiceResponse<AssetModel[]>> {
    return this.get<AssetModel[]>(`/manufacturer/${manufacturerId}`)
  }

  /**
   * Get models by type
   */
  async getByType(typeId: number): Promise<ServiceResponse<AssetModel[]>> {
    return this.get<AssetModel[]>(`/type/${typeId}`)
  }

  /**
   * Upload model image
   */
  async uploadImage(modelId: number | string, file: File): Promise<ServiceResponse<{ image_url: string }>> {
    const formData = new FormData()
    formData.append('image', file)
    return this.post<{ image_url: string }>(`/${modelId}/image`, formData)
  }
}

// Export service instances
export const divisionService = new DivisionService()
export const locationService = new LocationService()
export const manufacturerService = new ManufacturerService()
export const warrantyTypeService = new WarrantyTypeService()
export const assetTypeService = new AssetTypeService()
export const assetStatusService = new AssetStatusService()
export const assetModelService = new AssetModelService()

export default {
  divisionService,
  locationService,
  manufacturerService,
  warrantyTypeService,
  assetTypeService,
  assetStatusService,
  assetModelService,
}
