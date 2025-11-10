/**
 * Admin Bookings Management Functions
 */

import { createAdminClient } from './supabase/server'
import { Result, ErrorCodes } from './types'

export interface Booking {
  id: string
  worker_id: string
  employer_id: string
  service_type: string | null
  start_date: string
  end_date: string | null
  total_hours: number | null
  hourly_rate: number | null
  total_amount: number | null
  currency: string
  status: string
  created_at: string
  updated_at: string
}

export interface BookingWithDetails extends Booking {
  worker: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
  employer: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export interface BookingFilters {
  status?: string
  workerId?: string
  employerId?: string
  startDate?: string
  endDate?: string
}

/**
 * Get all bookings with filtering
 */
export async function getAllBookings(
  filters?: BookingFilters,
  limit = 50,
  offset = 0
): Promise<Result<{ bookings: BookingWithDetails[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        worker:users!worker_id (
          id,
          email,
          full_name,
          avatar_url
        ),
        employer:users!employer_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.workerId) {
      query = query.eq('worker_id', filters.workerId)
    }
    if (filters?.employerId) {
      query = query.eq('employer_id', filters.employerId)
    }
    if (filters?.startDate) {
      query = query.gte('start_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('start_date', filters.endDate)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch bookings',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: {
        bookings: data as BookingWithDetails[],
        total: count || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(
  bookingId: string
): Promise<Result<BookingWithDetails>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        *,
        worker:users!worker_id (
          id,
          email,
          full_name,
          avatar_url
        ),
        employer:users!employer_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq('id', bookingId)
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Booking not found',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: data as BookingWithDetails,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update booking status',
          details: error.message,
        },
      }
    }

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCodes.UNKNOWN_ERROR,
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }
  }
}
