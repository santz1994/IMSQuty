/**
 * Ticket Service
 * Business logic for ticket/helpdesk management
 */

import { CRUDService, PaginationParams, ServiceResponse } from './BaseService'

export interface Ticket {
  id: number
  ticket_number: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  requester_id: number
  assigned_to_id?: number
  asset_id?: number
  division_id?: number
  location_id?: number
  resolution?: string
  due_date?: string
  resolved_at?: string
  closed_at?: string
  created_at?: string
  updated_at?: string
  // Relations
  requester?: any
  assignedTo?: any
  asset?: any
  division?: any
  location?: any
  comments?: TicketComment[]
  attachments?: TicketAttachment[]
  history?: TicketHistory[]
}

export interface TicketComment {
  id: number
  ticket_id: number
  user_id: number
  comment: string
  is_internal: boolean
  created_at?: string
  updated_at?: string
  // Relations
  user?: any
}

export interface TicketAttachment {
  id: number
  ticket_id: number
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  uploaded_by: number
  created_at?: string
}

export interface TicketHistory {
  id: number
  ticket_id: number
  user_id: number
  action: string
  field?: string
  old_value?: string
  new_value?: string
  description: string
  created_at?: string
  // Relations
  user?: any
}

export interface TicketStats {
  total: number
  open: number
  in_progress: number
  pending: number
  resolved: number
  closed: number
  overdue: number
  avg_resolution_time: number
  by_priority: Array<{ priority: string; count: number }>
  by_category: Array<{ category: string; count: number }>
}

class TicketService extends CRUDService<Ticket> {
  constructor() {
    super('/tickets')
  }

  /**
   * Get ticket statistics
   */
  async getStats(): Promise<ServiceResponse<TicketStats>> {
    return this.get<TicketStats>('/stats')
  }

  /**
   * Get tickets by status
   */
  async getByStatus(status: string, params?: PaginationParams): Promise<ServiceResponse<Ticket[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<Ticket[]>(`/status/${status}${query}`)
  }

  /**
   * Get tickets by priority
   */
  async getByPriority(priority: string, params?: PaginationParams): Promise<ServiceResponse<Ticket[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<Ticket[]>(`/priority/${priority}${query}`)
  }

  /**
   * Get my tickets (assigned to me)
   */
  async getMyTickets(params?: PaginationParams): Promise<ServiceResponse<Ticket[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<Ticket[]>(`/my${query}`)
  }

  /**
   * Get tickets I created
   */
  async getMyRequests(params?: PaginationParams): Promise<ServiceResponse<Ticket[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<Ticket[]>(`/requests${query}`)
  }

  /**
   * Assign ticket to user
   */
  async assign(ticketId: number | string, userId: number): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/assign`, { user_id: userId })
  }

  /**
   * Unassign ticket
   */
  async unassign(ticketId: number | string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/unassign`)
  }

  /**
   * Change ticket status
   */
  async changeStatus(ticketId: number | string, status: string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/status`, { status })
  }

  /**
   * Change ticket priority
   */
  async changePriority(ticketId: number | string, priority: string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/priority`, { priority })
  }

  /**
   * Resolve ticket
   */
  async resolve(ticketId: number | string, resolution: string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/resolve`, { resolution })
  }

  /**
   * Close ticket
   */
  async close(ticketId: number | string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/close`)
  }

  /**
   * Reopen ticket
   */
  async reopen(ticketId: number | string, reason: string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/reopen`, { reason })
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    ticketId: number | string,
    comment: string,
    isInternal: boolean = false
  ): Promise<ServiceResponse<TicketComment>> {
    return this.post<TicketComment>(`/${ticketId}/comments`, {
      comment,
      is_internal: isInternal,
    })
  }

  /**
   * Get ticket comments
   */
  async getComments(ticketId: number | string): Promise<ServiceResponse<TicketComment[]>> {
    return this.get<TicketComment[]>(`/${ticketId}/comments`)
  }

  /**
   * Update comment
   */
  async updateComment(
    ticketId: number | string,
    commentId: number | string,
    comment: string
  ): Promise<ServiceResponse<TicketComment>> {
    return this.put<TicketComment>(`/${ticketId}/comments/${commentId}`, { comment })
  }

  /**
   * Delete comment
   */
  async deleteComment(ticketId: number | string, commentId: number | string): Promise<ServiceResponse<void>> {
    return this.delete<void>(`/${ticketId}/comments/${commentId}`)
  }

  /**
   * Upload attachment
   */
  async uploadAttachment(ticketId: number | string, file: File): Promise<ServiceResponse<TicketAttachment>> {
    const formData = new FormData()
    formData.append('file', file)
    return this.post<TicketAttachment>(`/${ticketId}/attachments`, formData)
  }

  /**
   * Get ticket attachments
   */
  async getAttachments(ticketId: number | string): Promise<ServiceResponse<TicketAttachment[]>> {
    return this.get<TicketAttachment[]>(`/${ticketId}/attachments`)
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(ticketId: number | string, attachmentId: number | string): Promise<ServiceResponse<void>> {
    return this.delete<void>(`/${ticketId}/attachments/${attachmentId}`)
  }

  /**
   * Get ticket history
   */
  async getHistory(ticketId: number | string): Promise<ServiceResponse<TicketHistory[]>> {
    return this.get<TicketHistory[]>(`/${ticketId}/history`)
  }

  /**
   * Link asset to ticket
   */
  async linkAsset(ticketId: number | string, assetId: number): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/link-asset`, { asset_id: assetId })
  }

  /**
   * Unlink asset from ticket
   */
  async unlinkAsset(ticketId: number | string): Promise<ServiceResponse<Ticket>> {
    return this.post<Ticket>(`/${ticketId}/unlink-asset`)
  }

  /**
   * Get overdue tickets
   */
  async getOverdue(params?: PaginationParams): Promise<ServiceResponse<Ticket[]>> {
    const query = params ? this.buildQueryString(params) : ''
    return this.get<Ticket[]>(`/overdue${query}`)
  }

  /**
   * Bulk assign tickets
   */
  async bulkAssign(ticketIds: number[], userId: number): Promise<ServiceResponse<{ updated: number }>> {
    return this.post<{ updated: number }>('/bulk-assign', { ticket_ids: ticketIds, user_id: userId })
  }

  /**
   * Bulk change status
   */
  async bulkChangeStatus(ticketIds: number[], status: string): Promise<ServiceResponse<{ updated: number }>> {
    return this.post<{ updated: number }>('/bulk-status', { ticket_ids: ticketIds, status })
  }

  /**
   * Export tickets
   */
  async export(format: 'excel' | 'csv' | 'pdf' = 'excel', filters?: any): Promise<Blob> {
    const response = await this.get<Blob>(`/export?format=${format}`, filters)
    return response.data as Blob
  }

  /**
   * Get ticket categories
   */
  async getCategories(): Promise<ServiceResponse<string[]>> {
    return this.get<string[]>('/categories')
  }
}

// Export singleton instance
export const ticketService = new TicketService()
export default ticketService
