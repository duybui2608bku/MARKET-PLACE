/**
 * Admin Worker Management Functions
 * Provides server-side functions for managing workers
 */

import { createAdminClient } from './supabase/server'
import { Result, AppError, ErrorCodes } from './types'

export interface WorkerWithProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  account_status: string
  created_at: string
  worker_profile: {
    bio: string | null
    service_type: string | null
    service_categories: string[] | null
    hourly_rate: number | null
    daily_rate: number | null
    monthly_rate: number | null
    rating: number | null
    total_reviews: number
    completed_jobs: number
    total_jobs: number
    city: string | null
    district: string | null
    approval_status: string
    profile_status: string
    is_verified: boolean
    created_at: string
    updated_at: string
  } | null
}

export interface WorkerFilters {
  status?: 'pending' | 'approved' | 'rejected'
  accountStatus?: 'active' | 'suspended' | 'banned'
  profileStatus?: 'draft' | 'active' | 'inactive' | 'suspended'
  city?: string
  serviceType?: string
  verified?: boolean
  search?: string
}

/**
 * Get all workers with optional filtering
 */
export async function getAllWorkers(
  filters?: WorkerFilters,
  limit = 50,
  offset = 0
): Promise<Result<{ workers: WorkerWithProfile[]; total: number }>> {
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
        created_at,
        worker_profiles (
          bio,
          service_type,
          service_categories,
          hourly_rate,
          daily_rate,
          monthly_rate,
          rating,
          total_reviews,
          completed_jobs,
          total_jobs,
          city,
          district,
          approval_status,
          profile_status,
          is_verified,
          created_at,
          updated_at
        )
      `,
        { count: 'exact' }
      )
      .eq('role', 'worker')

    // Apply filters
    if (filters?.status) {
      query = query.eq('worker_profiles.approval_status', filters.status)
    }
    if (filters?.accountStatus) {
      query = query.eq('account_status', filters.accountStatus)
    }
    if (filters?.profileStatus) {
      query = query.eq('worker_profiles.profile_status', filters.profileStatus)
    }
    if (filters?.city) {
      query = query.eq('worker_profiles.city', filters.city)
    }
    if (filters?.serviceType) {
      query = query.eq('worker_profiles.service_type', filters.serviceType)
    }
    if (filters?.verified !== undefined) {
      query = query.eq('worker_profiles.is_verified', filters.verified)
    }
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
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
          message: 'Failed to fetch workers',
          details: error.message,
        },
      }
    }

    const workers: WorkerWithProfile[] = data.map((user: any) => ({
      ...user,
      worker_profile: Array.isArray(user.worker_profiles)
        ? user.worker_profiles[0] || null
        : user.worker_profiles || null,
    }))

    return {
      success: true,
      data: {
        workers,
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
 * Get worker by ID with full profile
 */
export async function getWorkerById(
  workerId: string
): Promise<Result<WorkerWithProfile>> {
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
        worker_profiles (
          bio,
          skills,
          experience_years,
          service_type,
          service_categories,
          service_description,
          hourly_rate,
          daily_rate,
          monthly_rate,
          currency,
          rating,
          total_reviews,
          completed_jobs,
          total_jobs,
          city,
          district,
          country,
          address,
          latitude,
          longitude,
          approval_status,
          approved_at,
          approved_by,
          rejection_reason,
          profile_status,
          is_verified,
          verified_at,
          available,
          portfolio_images,
          gallery_images,
          service_images,
          languages,
          certifications,
          facebook_url,
          linkedin_url,
          website_url,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', workerId)
      .eq('role', 'worker')
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'Worker not found',
          details: error.message,
        },
      }
    }

    const worker: WorkerWithProfile = {
      ...data,
      worker_profile: Array.isArray(data.worker_profiles)
        ? data.worker_profiles[0] || null
        : data.worker_profiles || null,
    }

    return { success: true, data: worker }
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
 * Approve worker profile
 */
export async function approveWorkerProfile(
  workerId: string,
  adminId: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('worker_profiles')
      .update({
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId,
        profile_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to approve worker profile',
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
 * Reject worker profile
 */
export async function rejectWorkerProfile(
  workerId: string,
  reason: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('worker_profiles')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason,
        profile_status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to reject worker profile',
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
 * Suspend user account
 */
export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspended_by: adminId,
        suspension_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to suspend user',
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
 * Unsuspend user account
 */
export async function unsuspendUser(userId: string): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'active',
        suspended_at: null,
        suspended_by: null,
        suspension_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to unsuspend user',
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
 * Ban user account
 */
export async function banUser(
  userId: string,
  adminId: string,
  reason: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'banned',
        banned_at: new Date().toISOString(),
        banned_by: adminId,
        ban_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to ban user',
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
 * Unban user account
 */
export async function unbanUser(userId: string): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('users')
      .update({
        account_status: 'active',
        banned_at: null,
        banned_by: null,
        ban_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to unban user',
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
 * Update worker profile (admin override)
 */
export async function updateWorkerProfile(
  workerId: string,
  updates: any
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('worker_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update worker profile',
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
 * Update user admin notes
 */
export async function updateUserAdminNotes(
  userId: string,
  notes: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('users')
      .update({
        admin_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update admin notes',
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
