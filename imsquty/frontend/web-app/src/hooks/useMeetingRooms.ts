/**
 * Meeting Room Hook
 * Custom React hook for meeting room and booking operations
 */

import { useCallback, useEffect, useState } from 'react'
import meetingRoomService, { Booking, CreateBookingData, CreateRoomData, MeetingRoom } from '../services/MeetingRoomService'

export const useMeetingRooms = (autoFetch = false) => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.getRooms()
      if (response.success && response.data) {
        setRooms(response.data)
      } else {
        setError(response.message || 'Failed to fetch meeting rooms')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching meeting rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  const createRoom = useCallback(async (data: CreateRoomData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.createRoom(data)
      if (response.success) {
        await fetchRooms()
        return response.data
      } else {
        setError(response.message || 'Failed to create room')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating room')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRooms])

  const updateRoom = useCallback(async (id: number, data: Partial<CreateRoomData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.updateRoom(id, data)
      if (response.success) {
        await fetchRooms()
        return response.data
      } else {
        setError(response.message || 'Failed to update room')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating room')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchRooms])

  const deleteRoom = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.deleteRoom(id)
      if (response.success) {
        await fetchRooms()
        return true
      } else {
        setError(response.message || 'Failed to delete room')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting room')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchRooms])

  useEffect(() => {
    if (autoFetch) {
      fetchRooms()
    }
  }, [autoFetch, fetchRooms])

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom
  }
}

export const useBookings = (autoFetch = false) => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.getBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        setError(response.message || 'Failed to fetch bookings')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMyBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.getMyBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        setError(response.message || 'Failed to fetch my bookings')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching my bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  const createBooking = useCallback(async (data: CreateBookingData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.createBooking(data)
      if (response.success) {
        await fetchBookings()
        return response.data
      } else {
        setError(response.message || 'Failed to create booking')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating booking')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  const updateBooking = useCallback(async (id: number, data: Partial<CreateBookingData>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.updateBooking(id, data)
      if (response.success) {
        await fetchBookings()
        return response.data
      } else {
        setError(response.message || 'Failed to update booking')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating booking')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  const cancelBooking = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.cancelBooking(id)
      if (response.success) {
        await fetchBookings()
        return true
      } else {
        setError(response.message || 'Failed to cancel booking')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while cancelling booking')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  const checkIn = useCallback(async (bookingId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.checkIn(bookingId)
      if (response.success) {
        await fetchBookings()
        return true
      } else {
        setError(response.message || 'Failed to check in')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during check in')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  const checkOut = useCallback(async (bookingId: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.checkOut(bookingId)
      if (response.success) {
        await fetchBookings()
        return true
      } else {
        setError(response.message || 'Failed to check out')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during check out')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  useEffect(() => {
    if (autoFetch) {
      fetchBookings()
    }
  }, [autoFetch, fetchBookings])

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    fetchMyBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    checkIn,
    checkOut
  }
}

/**
 * Combined hook for meeting rooms and bookings
 * Useful for components that need both rooms and bookings data
 */
export const useMeetingRoomsWithBookings = (autoFetch = false) => {
  const [rooms, setRooms] = useState<MeetingRoom[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.getRooms()
      if (response.success && response.data) {
        setRooms(response.data)
      } else {
        setError(response.message || 'Failed to fetch meeting rooms')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching meeting rooms')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.getBookings()
      if (response.success && response.data) {
        setBookings(response.data)
      } else {
        setError(response.message || 'Failed to fetch bookings')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  const createBooking = useCallback(async (data: CreateBookingData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await meetingRoomService.createBooking(data)
      if (response.success) {
        await fetchBookings()
        return response.data
      } else {
        setError(response.message || 'Failed to create booking')
        return null
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating booking')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  useEffect(() => {
    if (autoFetch) {
      fetchRooms()
      fetchBookings()
    }
  }, [autoFetch, fetchRooms, fetchBookings])

  return {
    rooms,
    bookings,
    loading,
    error,
    fetchRooms,
    fetchBookings,
    createBooking
  }
}
