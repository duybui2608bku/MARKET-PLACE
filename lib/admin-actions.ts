/**
 * Admin Actions Logging
 * Logs all administrative actions for audit trail
 */

import { createAdminClient } from './supabase/server'
import { Result, ErrorCodes } from './types'

export interface AdminAction {
  id: string
  admin_id: string
  admin_email: string
  action_type: string
  target_type: string
  target_id: string
  target_name: string | null
  changes: any
  reason: string | null
  notes: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AdminActionWithAdmin extends AdminAction {
  admin: {
    id: string
    email: string
    full_name: string | null
  } | null
}

export interface LogActionData {
  admin_id: string
  admin_email: string
  action_type: string
  target_type: string
  target_id: string
  target_name?: string
  changes?: any
  reason?: string
  notes?: string
  ip_address?: string
  user_agent?: string
}

/**
 * Log an admin action
 */
export async function logAdminAction(
  actionData: LogActionData
): Promise<Result<AdminAction>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_actions')
      .insert(actionData)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to log admin action',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: data as AdminAction,
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
 * Get admin actions with filtering
 */
export async function getAdminActions(
  filters?: {
    adminId?: string
    actionType?: string
    targetType?: string
    targetId?: string
    startDate?: string
    endDate?: string
  },
  limit = 100,
  offset = 0
): Promise<Result<{ actions: AdminActionWithAdmin[]; total: number }>> {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('admin_actions')
      .select(
        `
        *,
        admin:users!admin_id (
          id,
          email,
          full_name
        )
      `,
        { count: 'exact' }
      )

    // Apply filters
    if (filters?.adminId) {
      query = query.eq('admin_id', filters.adminId)
    }
    if (filters?.actionType) {
      query = query.eq('action_type', filters.actionType)
    }
    if (filters?.targetType) {
      query = query.eq('target_type', filters.targetType)
    }
    if (filters?.targetId) {
      query = query.eq('target_id', filters.targetId)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch admin actions',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: {
        actions: data as AdminActionWithAdmin[],
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
 * Get recent actions for a specific target
 */
export async function getTargetActionHistory(
  targetType: string,
  targetId: string,
  limit = 20
): Promise<Result<AdminActionWithAdmin[]>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('admin_actions')
      .select(
        `
        *,
        admin:users!admin_id (
          id,
          email,
          full_name
        )
      `
      )
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch target action history',
          details: error.message,
        },
      }
    }

    return {
      success: true,
      data: data as AdminActionWithAdmin[],
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
 * Get admin activity summary
 */
export async function getAdminActivitySummary(
  adminId: string,
  days = 30
): Promise<
  Result<{
    totalActions: number
    actionsByType: Record<string, number>
    recentActions: AdminAction[]
  }>
> {
  try {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('admin_actions')
      .select('*')
      .eq('admin_id', adminId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch admin activity summary',
          details: error.message,
        },
      }
    }

    const actionsByType: Record<string, number> = {}
    data.forEach((action) => {
      actionsByType[action.action_type] =
        (actionsByType[action.action_type] || 0) + 1
    })

    return {
      success: true,
      data: {
        totalActions: data.length,
        actionsByType,
        recentActions: data.slice(0, 10) as AdminAction[],
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
 * Helper function to log common admin actions
 */

export async function logApproveWorker(
  adminId: string,
  adminEmail: string,
  workerId: string,
  workerName: string
) {
  return logAdminAction({
    admin_id: adminId,
    admin_email: adminEmail,
    action_type: 'approve_worker',
    target_type: 'worker_profile',
    target_id: workerId,
    target_name: workerName,
  })
}

export async function logRejectWorker(
  adminId: string,
  adminEmail: string,
  workerId: string,
  workerName: string,
  reason: string
) {
  return logAdminAction({
    admin_id: adminId,
    admin_email: adminEmail,
    action_type: 'reject_worker',
    target_type: 'worker_profile',
    target_id: workerId,
    target_name: workerName,
    reason,
  })
}

export async function logSuspendUser(
  adminId: string,
  adminEmail: string,
  userId: string,
  userName: string,
  reason: string
) {
  return logAdminAction({
    admin_id: adminId,
    admin_email: adminEmail,
    action_type: 'suspend_user',
    target_type: 'user',
    target_id: userId,
    target_name: userName,
    reason,
  })
}

export async function logBanUser(
  adminId: string,
  adminEmail: string,
  userId: string,
  userName: string,
  reason: string
) {
  return logAdminAction({
    admin_id: adminId,
    admin_email: adminEmail,
    action_type: 'ban_user',
    target_type: 'user',
    target_id: userId,
    target_name: userName,
    reason,
  })
}

export async function logResolveReport(
  adminId: string,
  adminEmail: string,
  reportId: string,
  reportTitle: string,
  resolutionNotes: string
) {
  return logAdminAction({
    admin_id: adminId,
    admin_email: adminEmail,
    action_type: 'resolve_report',
    target_type: 'report',
    target_id: reportId,
    target_name: reportTitle,
    notes: resolutionNotes,
  })
}
