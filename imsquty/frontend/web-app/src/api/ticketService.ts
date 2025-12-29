import apiClient from './client'

export interface Ticket {
  id: number
  ticket_number: string
  title: string
  description: string
  ticket_type_id: number
  ticket_status_id: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_by: number
  assigned_to: number
  location_id: number
  asset_id: number
  due_date: string
  created_at: string
  updated_at: string
}

export interface TicketListResponse {
  success: boolean
  data: Ticket[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  message: string
}

export interface TicketResponse {
  success: boolean
  data: Ticket
  message: string
}

export const ticketService = {
  getTickets: async (
    page = 1,
    perPage = 10,
    filters?: Record<string, any>,
  ): Promise<TicketListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters || {})
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => [k, v.toString()]),
      ),
    })
    const response = await apiClient.get<TicketListResponse>(
      `/tickets?${params}`,
    )
    return response.data
  },

  getTicket: async (id: number): Promise<TicketResponse> => {
    const response = await apiClient.get<TicketResponse>(`/tickets/${id}`)
    return response.data
  },

  createTicket: async (data: Partial<Ticket>): Promise<TicketResponse> => {
    const response = await apiClient.post<TicketResponse>('/tickets', data)
    return response.data
  },

  updateTicket: async (
    id: number,
    data: Partial<Ticket>,
  ): Promise<TicketResponse> => {
    const response = await apiClient.put<TicketResponse>(`/tickets/${id}`, data)
    return response.data
  },

  deleteTicket: async (id: number): Promise<TicketResponse> => {
    const response = await apiClient.delete<TicketResponse>(`/tickets/${id}`)
    return response.data
  },

  searchTickets: async (query: string): Promise<TicketListResponse> => {
    const response = await apiClient.get<TicketListResponse>(
      `/tickets/search?q=${query}`,
    )
    return response.data
  },

  assignTicket: async (
    ticketId: number,
    userId: number,
  ): Promise<TicketResponse> => {
    const response = await apiClient.post<TicketResponse>(
      `/tickets/${ticketId}/assign`,
      { assigned_to: userId },
    )
    return response.data
  },
}
