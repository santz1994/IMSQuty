/**
 * useTickets Hook
 * React hook for ticket management
 */

import { useState, useEffect, useCallback } from 'react'
import ticketRepository from '../repositories/TicketRepository'
import { 
  Ticket, 
  TicketComment, 
  TicketAttachment, 
  TicketStats 
} from '../services/TicketService'
import { PaginationParams } from '../services/BaseService'

interface UseTicketsResult {
  tickets: Ticket[]
  stats: TicketStats | null
  loading: boolean
  error: string | null
  fetchTickets: (params?: PaginationParams) => Promise<void>
  getTicketById: (id: number | string) => Promise<Ticket | null>
  createTicket: (data: Partial<Ticket>) => Promise<Ticket | null>
  updateTicket: (id: number | string, data: Partial<Ticket>) => Promise<Ticket | null>
  deleteTicket: (id: number | string) => Promise<boolean>
  assignTicket: (ticketId: number | string, userId: number) => Promise<boolean>
  changeStatus: (ticketId: number | string, status: string) => Promise<boolean>
  resolveTicket: (ticketId: number | string, resolution: string) => Promise<boolean>
  closeTicket: (ticketId: number | string) => Promise<boolean>
  refreshTickets: () => Promise<void>
}

interface UseTicketStatsResult {
  stats: TicketStats | null
  loading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  refreshStats: () => Promise<void>
}

/**
 * Main tickets hook
 */
export function useTickets(autoFetch: boolean = false, params?: PaginationParams): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async (fetchParams?: PaginationParams) => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketRepository.getAll(fetchParams || params)
      if (data) {
        setTickets(data)
      } else {
        setError('Failed to fetch tickets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  const getTicketById = useCallback(async (id: number | string): Promise<Ticket | null> => {
    setError(null)
    try {
      return await ticketRepository.getById(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [])

  const createTicket = useCallback(async (data: Partial<Ticket>): Promise<Ticket | null> => {
    setLoading(true)
    setError(null)
    try {
      const newTicket = await ticketRepository.create(data)
      if (newTicket) {
        setTickets(prev => [newTicket, ...prev])
        return newTicket
      } else {
        setError('Failed to create ticket')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTicket = useCallback(async (id: number | string, data: Partial<Ticket>): Promise<Ticket | null> => {
    setLoading(true)
    setError(null)
    try {
      const updatedTicket = await ticketRepository.update(id, data)
      if (updatedTicket) {
        setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t))
        return updatedTicket
      } else {
        setError('Failed to update ticket')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteTicket = useCallback(async (id: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const success = await ticketRepository.delete(id)
      if (success) {
        setTickets(prev => prev.filter(t => t.id !== id))
        return true
      } else {
        setError('Failed to delete ticket')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const assignTicket = useCallback(async (ticketId: number | string, userId: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const ticket = await ticketRepository.assign(ticketId, userId)
      if (ticket) {
        setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t))
        return true
      } else {
        setError('Failed to assign ticket')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const changeStatus = useCallback(async (ticketId: number | string, status: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const ticket = await ticketRepository.changeStatus(ticketId, status)
      if (ticket) {
        setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t))
        return true
      } else {
        setError('Failed to change status')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const resolveTicket = useCallback(async (ticketId: number | string, resolution: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const ticket = await ticketRepository.resolve(ticketId, resolution)
      if (ticket) {
        setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t))
        return true
      } else {
        setError('Failed to resolve ticket')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const closeTicket = useCallback(async (ticketId: number | string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const ticket = await ticketRepository.close(ticketId)
      if (ticket) {
        setTickets(prev => prev.map(t => t.id === ticketId ? ticket : t))
        return true
      } else {
        setError('Failed to close ticket')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTickets = useCallback(async () => {
    await fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    if (autoFetch) {
      fetchTickets()
    }
  }, [autoFetch, fetchTickets])

  return {
    tickets,
    stats,
    loading,
    error,
    fetchTickets,
    getTicketById,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicket,
    changeStatus,
    resolveTicket,
    closeTicket,
    refreshTickets,
  }
}

/**
 * Hook for ticket statistics
 */
export function useTicketStats(autoFetch: boolean = false): UseTicketStatsResult {
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketRepository.getStats()
      if (data) {
        setStats(data)
      } else {
        setError('Failed to fetch statistics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    const data = await ticketRepository.getStats(true)
    if (data) setStats(data)
  }, [])

  useEffect(() => {
    if (autoFetch) {
      fetchStats()
    }
  }, [autoFetch, fetchStats])

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  }
}

/**
 * Hook for my tickets (assigned to me)
 */
export function useMyTickets(autoFetch: boolean = false, params?: PaginationParams) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketRepository.getMyTickets(params)
      if (data) {
        setTickets(data)
      } else {
        setError('Failed to fetch my tickets')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    if (autoFetch) {
      fetchTickets()
    }
  }, [autoFetch, fetchTickets])

  return { tickets, loading, error, fetchTickets }
}

/**
 * Hook for ticket comments
 */
export function useTicketComments(ticketId: number | string, autoFetch: boolean = false) {
  const [comments, setComments] = useState<TicketComment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketRepository.getComments(ticketId)
      if (data) {
        setComments(data)
      } else {
        setError('Failed to fetch comments')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  const addComment = useCallback(async (comment: string, isInternal: boolean = false): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const newComment = await ticketRepository.addComment(ticketId, comment, isInternal)
      if (newComment) {
        setComments(prev => [...prev, newComment])
        return true
      } else {
        setError('Failed to add comment')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    if (autoFetch) {
      fetchComments()
    }
  }, [autoFetch, fetchComments])

  return { comments, loading, error, fetchComments, addComment }
}

/**
 * Hook for ticket attachments
 */
export function useTicketAttachments(ticketId: number | string, autoFetch: boolean = false) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttachments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ticketRepository.getAttachments(ticketId)
      if (data) {
        setAttachments(data)
      } else {
        setError('Failed to fetch attachments')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  const uploadAttachment = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const newAttachment = await ticketRepository.uploadAttachment(ticketId, file)
      if (newAttachment) {
        setAttachments(prev => [...prev, newAttachment])
        return true
      } else {
        setError('Failed to upload attachment')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    if (autoFetch) {
      fetchAttachments()
    }
  }, [autoFetch, fetchAttachments])

  return { attachments, loading, error, fetchAttachments, uploadAttachment }
}

export default useTickets
