/**
 * Ticket Repository
 * Data access layer for ticket management with caching
 */

import { BaseRepository } from './BaseRepository'
import ticketService, {
  Ticket,
  TicketComment,
  TicketAttachment,
  TicketHistory,
  TicketStats,
} from '../services/TicketService'
import { PaginationParams } from '../services/BaseService'

class TicketRepository extends BaseRepository<Ticket> {
  constructor() {
    super({
      cacheEnabled: true,
      cacheDuration: 180000, // 3 minutes for tickets
    })
  }

  /**
   * Get all tickets with caching
   */
  async getAll(params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `list_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getAll(params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get ticket by ID
   */
  async getById(id: number | string, forceRefresh: boolean = false): Promise<Ticket | null> {
    const cacheKey = `ticket_${id}`
    
    if (!forceRefresh) {
      const cached = this.getFromCache<Ticket>(cacheKey)
      if (cached) return cached
    }

    const response = await ticketService.getById(id)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Create new ticket
   */
  async create(data: Partial<Ticket>): Promise<Ticket | null> {
    const response = await ticketService.create(data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate list and stats caches
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    this.invalidateCachePattern(/^my_/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Update ticket
   */
  async update(id: number | string, data: Partial<Ticket>): Promise<Ticket | null> {
    const response = await ticketService.update(id, data)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear specific ticket and list caches
    this.clearCache(`ticket_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Delete ticket
   */
  async delete(id: number | string): Promise<boolean> {
    const response = await ticketService.remove(id)
    if (!this.isSuccess(response)) {
      return false
    }

    // Clear all related caches
    this.clearCache(`ticket_${id}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    this.invalidateCachePattern(/^comments_/)
    this.invalidateCachePattern(/^attachments_/)
    
    return true
  }

  /**
   * Get ticket statistics
   */
  async getStats(forceRefresh: boolean = false): Promise<TicketStats | null> {
    if (!forceRefresh) {
      const cached = this.getFromCache<TicketStats>('stats')
      if (cached) return cached
    }

    const response = await ticketService.getStats()
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TicketStats>(response)
    if (data) {
      // Shorter cache for stats (1 minute)
      this.setCache('stats', data, 60000)
    }
    return data
  }

  /**
   * Get tickets by status
   */
  async getByStatus(status: string, params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `status_${status}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getByStatus(status, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get tickets by priority
   */
  async getByPriority(priority: string, params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `priority_${priority}_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getByPriority(priority, params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Get my tickets (assigned to me)
   */
  async getMyTickets(params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `my_tickets_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getMyTickets(params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      // Shorter cache for personal tickets (1 minute)
      this.setCache(cacheKey, data, 60000)
    }
    return data
  }

  /**
   * Get tickets I created
   */
  async getMyRequests(params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `my_requests_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getMyRequests(params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      this.setCache(cacheKey, data, 60000)
    }
    return data
  }

  /**
   * Assign ticket to user
   */
  async assign(ticketId: number | string, userId: number): Promise<Ticket | null> {
    const response = await ticketService.assign(ticketId, userId)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear ticket cache
    this.clearCache(`ticket_${ticketId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^my_/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Change ticket status
   */
  async changeStatus(ticketId: number | string, status: string): Promise<Ticket | null> {
    const response = await ticketService.changeStatus(ticketId, status)
    if (!this.isSuccess(response)) {
      return null
    }

    // Clear ticket and related caches
    this.clearCache(`ticket_${ticketId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    this.invalidateCachePattern(/^status_/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Resolve ticket
   */
  async resolve(ticketId: number | string, resolution: string): Promise<Ticket | null> {
    const response = await ticketService.resolve(ticketId, resolution)
    if (!this.isSuccess(response)) {
      return null
    }

    this.clearCache(`ticket_${ticketId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Close ticket
   */
  async close(ticketId: number | string): Promise<Ticket | null> {
    const response = await ticketService.close(ticketId)
    if (!this.isSuccess(response)) {
      return null
    }

    this.clearCache(`ticket_${ticketId}`)
    this.invalidateCachePattern(/^list_/)
    this.invalidateCachePattern(/^stats/)
    
    return this.extractData<Ticket>(response)
  }

  /**
   * Get ticket comments
   */
  async getComments(ticketId: number | string, forceRefresh: boolean = false): Promise<TicketComment[] | null> {
    const cacheKey = `comments_${ticketId}`
    
    if (!forceRefresh) {
      const cached = this.getFromCache<TicketComment[]>(cacheKey)
      if (cached) return cached
    }

    const response = await ticketService.getComments(ticketId)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TicketComment[]>(response)
    if (data) {
      // Short cache for comments (1 minute)
      this.setCache(cacheKey, data, 60000)
    }
    return data
  }

  /**
   * Add comment
   */
  async addComment(ticketId: number | string, comment: string, isInternal: boolean = false): Promise<TicketComment | null> {
    const response = await ticketService.addComment(ticketId, comment, isInternal)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate comments cache
    this.clearCache(`comments_${ticketId}`)
    
    return this.extractData<TicketComment>(response)
  }

  /**
   * Get ticket attachments
   */
  async getAttachments(ticketId: number | string, forceRefresh: boolean = false): Promise<TicketAttachment[] | null> {
    const cacheKey = `attachments_${ticketId}`
    
    if (!forceRefresh) {
      const cached = this.getFromCache<TicketAttachment[]>(cacheKey)
      if (cached) return cached
    }

    const response = await ticketService.getAttachments(ticketId)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<TicketAttachment[]>(response)
    if (data) {
      this.setCache(cacheKey, data)
    }
    return data
  }

  /**
   * Upload attachment
   */
  async uploadAttachment(ticketId: number | string, file: File): Promise<TicketAttachment | null> {
    const response = await ticketService.uploadAttachment(ticketId, file)
    if (!this.isSuccess(response)) {
      return null
    }

    // Invalidate attachments cache
    this.clearCache(`attachments_${ticketId}`)
    
    return this.extractData<TicketAttachment>(response)
  }

  /**
   * Get overdue tickets
   */
  async getOverdue(params?: PaginationParams): Promise<Ticket[] | null> {
    const cacheKey = `overdue_${JSON.stringify(params || {})}`
    const cached = this.getFromCache<Ticket[]>(cacheKey)
    if (cached) return cached

    const response = await ticketService.getOverdue(params)
    if (!this.isSuccess(response)) {
      return null
    }

    const data = this.extractData<Ticket[]>(response)
    if (data) {
      // Very short cache for overdue (30 seconds)
      this.setCache(cacheKey, data, 30000)
    }
    return data
  }

  /**
   * Refresh ticket data
   */
  async refreshTicket(id: number | string): Promise<Ticket | null> {
    this.clearCache(`ticket_${id}`)
    return this.getById(id, true)
  }
}

// Export singleton instance
export const ticketRepository = new TicketRepository()
export default ticketRepository
