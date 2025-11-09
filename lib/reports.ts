/**
 * Reports and Disputes Management Functions
 */

import { createAdminClient } from './supabase/server'
import { Result, ErrorCodes } from './types'

export interface Report {
  id: string
  reporter_id: string
  reporter_role: string
  reported_type: string
  reported_id: string
  reported_user_id: string | null
  category: string
  title: string
  description: string
  evidence_urls: string[] | null
  status: string
  priority: string
  assigned_to: string | null
  resolution_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
  action_taken: string | null
  warning_issued: boolean
  account_suspended: boolean
  account_banned: boolean
  created_at: string
  updated_at: string
}

export interface ReportWithDetails extends Report {
  reporter: {
    id: string
    email: string
    full_name: string | null
  } | null
  reported_user: {
    id: string
    email: string
    full_name: string | null
  } | null
  assigned_admin: {
    id: string
    email: string
    full_name: string | null
  } | null
}

export interface ReportFilters {
  status?: string
  priority?: string
  category?: string
  reportedType?: string
  assignedTo?: string
  reporterId?: string
}

export interface CreateReportData {
  reporter_id: string
  reporter_role: string
  reported_type: string
  reported_id: string
  reported_user_id?: string
  category: string
  title: string
  description: string
  evidence_urls?: string[]
  priority?: string
}

/**
 * Get all reports with filtering
 */
export async function getAllReports(
  filters?: ReportFilters,
  limit = 50,
  offset = 0
): Promise<Result<{ reports: ReportWithDetails[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reporter_id (
          id,
          email,
          full_name
        ),
        reported_user:users!reported_user_id (
          id,
          email,
          full_name
        ),
        assigned_admin:users!assigned_to (
          id,
          email,
          full_name
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.reportedType) {
      query = query.eq('reported_type', filters.reportedType)
    }
    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo)
    }
    if (filters?.reporterId) {
      query = query.eq('reporter_id', filters.reporterId)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch reports',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: {
        reports: data as ReportWithDetails[],
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
 * Get report by ID
 */
export async function getReportById(
  reportId: string
): Promise<Result<ReportWithDetails>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        reporter:users!reporter_id (
          id,
          email,
          full_name,
          avatar_url
        ),
        reported_user:users!reported_user_id (
          id,
          email,
          full_name,
          avatar_url,
          role
        ),
        assigned_admin:users!assigned_to (
          id,
          email,
          full_name
        )
      `
      )
      .eq('id', reportId)
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Report not found',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: data as ReportWithDetails,
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
 * Create a new report
 */
export async function createReport(
  reportData: CreateReportData
): Promise<Result<Report>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to create report',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: data as Report,
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
 * Assign report to admin
 */
export async function assignReport(
  reportId: string,
  adminId: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reports')
      .update({
        assigned_to: adminId,
        status: 'investigating',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to assign report',
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
 * Update report priority
 */
export async function updateReportPriority(
  reportId: string,
  priority: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reports')
      .update({
        priority,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to update report priority',
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
 * Resolve report
 */
export async function resolveReport(
  reportId: string,
  adminId: string,
  resolutionNotes: string,
  actionTaken?: string,
  warningIssued?: boolean,
  accountSuspended?: boolean,
  accountBanned?: boolean
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        resolved_by: adminId,
        action_taken: actionTaken,
        warning_issued: warningIssued || false,
        account_suspended: accountSuspended || false,
        account_banned: accountBanned || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to resolve report',
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
 * Dismiss report
 */
export async function dismissReport(
  reportId: string,
  adminId: string,
  reason: string
): Promise<Result<void>> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('reports')
      .update({
        status: 'dismissed',
        resolution_notes: reason,
        resolved_at: new Date().toISOString(),
        resolved_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reportId)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to dismiss report',
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
 * Get reports statistics
 */
export async function getReportsStats(): Promise<
  Result<{
    total: number
    pending: number
    investigating: number
    resolved: number
    dismissed: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
  }>
> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from('reports').select('status, category, priority')

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch reports stats',
          details: error.message,
        },
      }
    }

    const stats = {
      total: data.length,
      pending: data.filter((r) => r.status === 'pending').length,
      investigating: data.filter((r) => r.status === 'investigating').length,
      resolved: data.filter((r) => r.status === 'resolved').length,
      dismissed: data.filter((r) => r.status === 'dismissed').length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
    }

    // Count by category
    data.forEach((r) => {
      stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + 1
      stats.byPriority[r.priority] = (stats.byPriority[r.priority] || 0) + 1
    })

    return { success: true, data: stats }
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
