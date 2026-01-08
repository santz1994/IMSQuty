/**
 * Master Data Repositories
 * Data access layer for all master data entities
 */

import { PaginationParams } from '../services/BaseService'
import {
  AssetModel,
  assetModelService,
  AssetStatus,
  assetStatusService,
  AssetType,
  assetTypeService,
  Division,
  divisionService,
  Location,
  locationService,
  Manufacturer,
  manufacturerService,
  WarrantyType,
  warrantyTypeService,
} from '../services/MasterDataServices'
import { CRUDRepository } from './BaseRepository'

/**
 * Division Repository
 */
class DivisionRepository extends CRUDRepository<Division> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 }) // 10 minutes
  }

  async getAll(params?: PaginationParams): Promise<Division[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Division[]>(cacheKey)
    if (cached) return cached

    const response = await divisionService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Division[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<Division | null> {
    const cacheKey = `division_${id}`
    const cached = this.getFromCache<Division>(cacheKey)
    if (cached) return cached

    const response = await divisionService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Division>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<Division>): Promise<Division | null> {
    const response = await divisionService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return this.extractData<Division>(response)
  }

  async update(id: number | string, data: Partial<Division>): Promise<Division | null> {
    const response = await divisionService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`division_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return this.extractData<Division>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await divisionService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`division_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return true
  }

  async getHierarchy(): Promise<Division[] | null> {
    const cached = this.getFromCache<Division[]>('hierarchy')
    if (cached) return cached

    const response = await divisionService.getHierarchy()
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Division[]>(response)
    if (data) this.setCache('hierarchy', data)
    return data
  }
}

/**
 * Location Repository
 */
class LocationRepository extends CRUDRepository<Location> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<Location[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Location[]>(cacheKey)
    if (cached) return cached

    const response = await locationService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Location[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<Location | null> {
    const cacheKey = `location_${id}`
    const cached = this.getFromCache<Location>(cacheKey)
    if (cached) return cached

    const response = await locationService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Location>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<Location>): Promise<Location | null> {
    const response = await locationService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return this.extractData<Location>(response)
  }

  async update(id: number | string, data: Partial<Location>): Promise<Location | null> {
    const response = await locationService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`location_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return this.extractData<Location>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await locationService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`location_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.clearCache('hierarchy')
    return true
  }

  async getHierarchy(): Promise<Location[] | null> {
    const cached = this.getFromCache<Location[]>('hierarchy')
    if (cached) return cached

    const response = await locationService.getHierarchy()
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Location[]>(response)
    if (data) this.setCache('hierarchy', data)
    return data
  }

  async getByType(type: string): Promise<Location[] | null> {
    const cacheKey = `type_${type}`
    const cached = this.getFromCache<Location[]>(cacheKey)
    if (cached) return cached

    const response = await locationService.getByType(type)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Location[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }
}

/**
 * Manufacturer Repository
 */
class ManufacturerRepository extends CRUDRepository<Manufacturer> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<Manufacturer[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Manufacturer[]>(cacheKey)
    if (cached) return cached

    const response = await manufacturerService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Manufacturer[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<Manufacturer | null> {
    const cacheKey = `manufacturer_${id}`
    const cached = this.getFromCache<Manufacturer>(cacheKey)
    if (cached) return cached

    const response = await manufacturerService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<Manufacturer>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<Manufacturer>): Promise<Manufacturer | null> {
    const response = await manufacturerService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    return this.extractData<Manufacturer>(response)
  }

  async update(id: number | string, data: Partial<Manufacturer>): Promise<Manufacturer | null> {
    const response = await manufacturerService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`manufacturer_${id}`)
    this.invalidateCachePattern(/^list_/)
    return this.extractData<Manufacturer>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await manufacturerService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`manufacturer_${id}`)
    this.invalidateCachePattern(/^list_/)
    return true
  }
}

/**
 * Warranty Type Repository
 */
class WarrantyTypeRepository extends CRUDRepository<WarrantyType> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<WarrantyType[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<WarrantyType[]>(cacheKey)
    if (cached) return cached

    const response = await warrantyTypeService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<WarrantyType[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<WarrantyType | null> {
    const cacheKey = `warranty_${id}`
    const cached = this.getFromCache<WarrantyType>(cacheKey)
    if (cached) return cached

    const response = await warrantyTypeService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<WarrantyType>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<WarrantyType>): Promise<WarrantyType | null> {
    const response = await warrantyTypeService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    return this.extractData<WarrantyType>(response)
  }

  async update(id: number | string, data: Partial<WarrantyType>): Promise<WarrantyType | null> {
    const response = await warrantyTypeService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`warranty_${id}`)
    this.invalidateCachePattern(/^list_/)
    return this.extractData<WarrantyType>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await warrantyTypeService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`warranty_${id}`)
    this.invalidateCachePattern(/^list_/)
    return true
  }

  async getActive(): Promise<WarrantyType[] | null> {
    const cached = this.getFromCache<WarrantyType[]>('active')
    if (cached) return cached

    const response = await warrantyTypeService.getActive()
    if (!this.isSuccess(response)) return null

    const data = this.extractData<WarrantyType[]>(response)
    if (data) this.setCache('active', data)
    return data
  }
}

/**
 * Asset Type Repository
 */
class AssetTypeRepository extends CRUDRepository<AssetType> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<AssetType[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<AssetType[]>(cacheKey)
    if (cached) return cached

    const response = await assetTypeService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetType[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<AssetType | null> {
    const cacheKey = `type_${id}`
    const cached = this.getFromCache<AssetType>(cacheKey)
    if (cached) return cached

    const response = await assetTypeService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetType>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<AssetType>): Promise<AssetType | null> {
    const response = await assetTypeService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetType>(response)
  }

  async update(id: number | string, data: Partial<AssetType>): Promise<AssetType | null> {
    const response = await assetTypeService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`type_${id}`)
    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetType>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await assetTypeService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`type_${id}`)
    this.invalidateCachePattern(/^list_/)
    return true
  }
}

/**
 * Asset Status Repository
 */
class AssetStatusRepository extends CRUDRepository<AssetStatus> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<AssetStatus[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<AssetStatus[]>(cacheKey)
    if (cached) return cached

    const response = await assetStatusService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetStatus[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<AssetStatus | null> {
    const cacheKey = `status_${id}`
    const cached = this.getFromCache<AssetStatus>(cacheKey)
    if (cached) return cached

    const response = await assetStatusService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetStatus>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<AssetStatus>): Promise<AssetStatus | null> {
    const response = await assetStatusService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetStatus>(response)
  }

  async update(id: number | string, data: Partial<AssetStatus>): Promise<AssetStatus | null> {
    const response = await assetStatusService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`status_${id}`)
    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetStatus>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await assetStatusService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`status_${id}`)
    this.invalidateCachePattern(/^list_/)
    return true
  }

  async getAvailable(): Promise<AssetStatus[] | null> {
    const cached = this.getFromCache<AssetStatus[]>('available')
    if (cached) return cached

    const response = await assetStatusService.getAvailable()
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetStatus[]>(response)
    if (data) this.setCache('available', data)
    return data
  }
}

/**
 * Asset Model Repository
 */
class AssetModelRepository extends CRUDRepository<AssetModel> {
  constructor() {
    super({ cacheEnabled: true, cacheDuration: 600000 })
  }

  async getAll(params?: PaginationParams): Promise<AssetModel[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<AssetModel[]>(cacheKey)
    if (cached) return cached

    const response = await assetModelService.getAll(params)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetModel[]>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async getById(id: number | string): Promise<AssetModel | null> {
    const cacheKey = `model_${id}`
    const cached = this.getFromCache<AssetModel>(cacheKey)
    if (cached) return cached

    const response = await assetModelService.getById(id)
    if (!this.isSuccess(response)) return null

    const data = this.extractData<AssetModel>(response)
    if (data) this.setCache(cacheKey, data)
    return data
  }

  async create(data: Partial<AssetModel>): Promise<AssetModel | null> {
    const response = await assetModelService.create(data)
    if (!this.isSuccess(response)) return null

    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetModel>(response)
  }

  async update(id: number | string, data: Partial<AssetModel>): Promise<AssetModel | null> {
    const response = await assetModelService.update(id, data)
    if (!this.isSuccess(response)) return null

    this.clearCache(`model_${id}`)
    this.invalidateCachePattern(/^list_/)
    return this.extractData<AssetModel>(response)
  }

  async delete(id: number | string): Promise<boolean> {
    const response = await assetModelService.remove(id)
    if (!this.isSuccess(response)) return false

    this.clearCache(`model_${id}`)
    this.invalidateCachePattern(/^list_/)
    return true
  }
}

// Export repository instances
export const divisionRepository = new DivisionRepository()
export const locationRepository = new LocationRepository()
export const manufacturerRepository = new ManufacturerRepository()
export const warrantyTypeRepository = new WarrantyTypeRepository()
export const assetTypeRepository = new AssetTypeRepository()
export const assetStatusRepository = new AssetStatusRepository()
export const assetModelRepository = new AssetModelRepository()

export default {
  divisionRepository,
  locationRepository,
  manufacturerRepository,
  warrantyTypeRepository,
  assetTypeRepository,
  assetStatusRepository,
  assetModelRepository,
}
