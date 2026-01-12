/**
 * Meeting Room Service
 * Handles all meeting room and booking operations
 */

import { BaseService, PaginationParams, ServiceResponse } from './BaseService'

export interface MeetingRoom {
  id: number
  name: string
  capacity: number
  floor: string
  building?: string
  description?: string
  status: 'available' | 'booked' | 'maintenance' | 'blocked'
  features: string[]
  created_at?: string
  updated_at?: string
}

export interface Booking {
  id: number
  room_id: number
  room?: MeetingRoom
  user_id: number
  title: string
  description?: string
  start_time: string
  end_time: string
  attendees: number
  status: 'pending' | 'approved' | 'rejected' | 'checked_in' | 'checked_out' | 'cancelled'
  purpose?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface CreateRoomData {
  name: string
  capacity: number
  floor: string
  building?: string
  description?: string
  features?: string[]
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  status?: 'available' | 'booked' | 'maintenance' | 'blocked'
}

export interface CreateBookingData {
  room_id: number
  title: string
  description?: string
  start_time: string
  end_time: string
  attendees: number
  purpose?: string
}

export interface CheckAvailabilityParams {
  room_id: number
  start_time: string
  end_time: string
}

class MeetingRoomService extends BaseService {
  constructor() {
    super('/meeting-rooms')
  }

  /**
   * Get all meeting rooms with pagination
   */
  async getRooms(params?: PaginationParams): Promise<ServiceResponse<MeetingRoom[]>> {
    try {
      const response = await this.get<MeetingRoom[]>('', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get single meeting room details
   */
  async getRoom(id: number): Promise<ServiceResponse<MeetingRoom>> {
    try {
      const response = await this.get<MeetingRoom>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new meeting room
   */
  async createRoom(data: CreateRoomData): Promise<ServiceResponse<MeetingRoom>> {
    try {
      const response = await this.post<MeetingRoom>('', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update meeting room
   */
  async updateRoom(id: number, data: UpdateRoomData): Promise<ServiceResponse<MeetingRoom>> {
    try {
      const response = await this.put<MeetingRoom>(`/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Delete meeting room
   */
  async deleteRoom(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await this.delete<void>(`/${id}`)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get all bookings with pagination
   */
  async getBookings(params?: PaginationParams): Promise<ServiceResponse<Booking[]>> {
    try {
      const response = await this.get<Booking[]>('/bookings', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(params?: PaginationParams): Promise<ServiceResponse<Booking[]>> {
    try {
      const response = await this.get<Booking[]>('/bookings/my', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Create new booking
   */
  async createBooking(data: CreateBookingData): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>('/bookings', data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Update booking
   */
  async updateBooking(id: number, data: Partial<CreateBookingData>): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.put<Booking>(`/bookings/${id}`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: number): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${id}/cancel`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Check room availability
   */
  async checkAvailability(params: CheckAvailabilityParams): Promise<ServiceResponse<{ available: boolean; conflicts?: Booking[] }>> {
    try {
      const response = await this.get<{ available: boolean; conflicts?: Booking[] }>('/bookings/check-availability', params)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Check in to booking
   */
  async checkIn(bookingId: number): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${bookingId}/check-in`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Check out from booking
   */
  async checkOut(bookingId: number): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${bookingId}/check-out`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Approve booking (admin/manager)
   */
  async approveBooking(bookingId: number): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${bookingId}/approve`, {})
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Reject booking (admin/manager)
   */
  async rejectBooking(bookingId: number, reason?: string): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${bookingId}/reject`, { reason })
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }

  /**
   * Request reschedule
   */
  async rescheduleBooking(bookingId: number, data: { start_time: string; end_time: string; reason?: string }): Promise<ServiceResponse<Booking>> {
    try {
      const response = await this.post<Booking>(`/bookings/${bookingId}/reschedule`, data)
      return response
    } catch (error) {
      return this.transformError(error)
    }
  }
}

// Export singleton instance
export const meetingRoomService = new MeetingRoomService()
export default meetingRoomService

