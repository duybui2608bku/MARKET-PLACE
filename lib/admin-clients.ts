/**
 * Admin Client (Employer) Management Functions
 * Provides server-side functions for managing clients/employers
 */

import { createAdminClient } from './supabase/server'
import { Result, AppError, ErrorCodes } from './types'

export interface ClientWithProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  account_status: string
  admin_notes: string | null
  warning_count: number
  created_at: string
  employer_profile: {
    company_name: string | null
    company_description: string | null
    industry: string | null
    company_size: string | null
    city: string | null
    district: string | null
    country: string | null
    address: string | null
    company_phone: string | null
    company_email: string | null
    website_url: string | null
    total_jobs_posted: number
    total_hires: number
    is_verified: boolean
    verified_at: string | null
    tax_code: string | null
    business_license: string | null
    created_at: string
    updated_at: string
  } | null
}

export interface ClientFilters {
  accountStatus?: 'active' | 'suspended' | 'banned'
  verified?: boolean
  city?: string
  industry?: string
  companySize?: string
  search?: string
}

/**
 * Get all clients with optional filtering
 */
export async function getAllClients(
  filters?: ClientFilters,
  limit = 50,
  offset = 0
): Promise<Result<{ clients: ClientWithProfile[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        phone,
        account_status,
        admin_notes,
        warning_count,
        created_at,
        employer_profiles (
          company_name,
          company_description,
          industry,
          company_size,
          city,
          district,
          country,
          address,
          company_phone,
          company_email,
          website_url,
          total_jobs_posted,
          total_hires,
          is_verified,
          verified_at,
          tax_code,
          business_license,
          created_at,
          updated_at
        )
      `,
        { count: 'exact' }
      )
      .eq('role', 'employer')

    // Apply filters
    if (filters?.accountStatus) {
      query = query.eq('account_status', filters.accountStatus)
    }
    if (filters?.verified !== undefined) {
      query = query.eq('employer_profiles.is_verified', filters.verified)
    }
    if (filters?.city) {
      query = query.eq('employer_profiles.city', filters.city)
    }
    if (filters?.industry) {
      query = query.eq('employer_profiles.industry', filters.industry)
    }
    if (filters?.companySize) {
      query = query.eq('employer_profiles.company_size', filters.companySize)
    }
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employer_profiles.company_name.ilike.%${filters.search}%`
      )
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch clients',
          details: error.message,
        },
      }
    }

    const clients: ClientWithProfile[] = data.map((user: any) => ({
      ...user,
      employer_profile: Array.isArray(user.employer_profiles)
        ? user.employer_profiles[0] || null
        : user.employer_profiles || null,
    }))

    return {
      success: true,
      data: {
        clients,
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
 * Get client by ID with full profile
 */
export async function getClientById(
  clientId: string
): Promise<Result<ClientWithProfile>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        phone,
        account_status,
        suspended_at,
        suspended_by,
        suspension_reason,
        banned_at,
        banned_by,
        ban_reason,
        admin_notes,
        warning_count,
        created_at,
        updated_at,
        employer_profiles (
          company_name,
          company_description,
          industry,
          company_size,
          city,
          district,
          country,
          address,
          company_phone,
          company_email,
          website_url,
          total_jobs_posted,
          total_hires,
          is_verified,
          verified_at,
          tax_code,
          business_license,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', clientId)
      .eq('role', 'employer')
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'Client not found',
          details: error.message,
        },
      }
    }

    const client: ClientWithProfile = {
      ...data,
      employer_profile: Array.isArray(data.employer_profiles)
        ? data.employer_profiles[0] || null
        : data.employer_profiles || null,
    }

    return { success: true, data: client }
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
 * Get client booking history
 */
export async function getClientBookings(
  clientId: string,
  limit = 50,
  offset = 0
): Promise<Result<{ bookings: any[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    const { data, error, count } = await supabase
      .from('bookings')
      .select(
        `
        id,
        worker_id,
        service_type,
        start_date,
        end_date,
        total_hours,
        hourly_rate,
        total_amount,
        currency,
        status,
        created_at,
        updated_at,
        workers:users!worker_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `,
        { count: 'exact' }
      )
      .eq('employer_id', clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch client bookings',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: {
        bookings: data || [],
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
 * Get client reviews
 */
export async function getClientReviews(
  clientId: string,
  limit = 50,
  offset = 0
): Promise<Result<{ reviews: any[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    const { data, error, count } = await supabase
      .from('reviews')
      .select(
        `
        id,
        worker_id,
        rating,
        title,
        comment,
        images,
        is_verified_purchase,
        is_hidden,
        hidden_at,
        hidden_by,
        hidden_reason,
        created_at,
        updated_at,
        workers:users!worker_id (
          id,
          full_name,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('employer_id', clientId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch client reviews',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: {
        reviews: data || [],
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
 * Update employer profile (admin override)
 */
export async function updateEmployerProfile(
  employerId: string,
  updates: any
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('employer_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employerId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update employer profile',
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

/**
 * Issue warning to client
 */
export async function issueWarningToClient(
  clientId: string,
  reason: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    // Get current warning count
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('warning_count, admin_notes')
      .eq('id', clientId)
      .single()

    if (fetchError) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch user',
          details: fetchError.message,
        },
      }
    }

    const currentWarnings = user?.warning_count || 0
    const newWarningCount = currentWarnings + 1

    // Update warning count and add to admin notes
    const { error } = await supabase
      .from('users')
      .update({
        warning_count: newWarningCount,
        admin_notes: `Warning ${newWarningCount}: ${reason}\n\n${user?.admin_notes || ''}`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to issue warning',
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
