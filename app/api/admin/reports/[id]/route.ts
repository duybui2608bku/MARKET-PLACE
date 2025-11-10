import { NextRequest } from 'next/server'
import { getReportById, assignReport, updateReportPriority, resolveReport, dismissReport } from '@/lib/reports'
import { logResolveReport, logAdminAction } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/reports/[id]
 * Get report by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication
    if (adminSecret) {
      const provided = req.headers.get('x-admin-secret')
      if (provided !== adminSecret) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { id } = await params
    const result = await getReportById(id)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 404 }
      )
    }

    return Response.json({ report: result.data })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/reports/[id]
 * Update report (assign, change priority, resolve, dismiss)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin authentication
    if (adminSecret) {
      const provided = req.headers.get('x-admin-secret')
      if (provided !== adminSecret) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { id } = await params
    const body = await req.json()
    const { action, admin_id, admin_email } = body

    if (!action) {
      return Response.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'assign':
        if (!body.assigned_to) {
          return Response.json(
            { error: 'assigned_to is required for assign action' },
            { status: 400 }
          )
        }
        result = await assignReport(id, body.assigned_to)
        if (admin_id && admin_email) {
          await logAdminAction({
            admin_id,
            admin_email,
            action_type: 'assign_report',
            target_type: 'report',
            target_id: id,
            target_name: body.report_title || 'Report',
          })
        }
        break

      case 'update_priority':
        if (!body.priority) {
          return Response.json(
            { error: 'priority is required for update_priority action' },
            { status: 400 }
          )
        }
        result = await updateReportPriority(id, body.priority)
        break

      case 'resolve':
        if (!body.resolution_notes || !admin_id) {
          return Response.json(
            { error: 'resolution_notes and admin_id are required for resolve action' },
            { status: 400 }
          )
        }
        result = await resolveReport(
          id,
          admin_id,
          body.resolution_notes,
          body.action_taken,
          body.warning_issued,
          body.account_suspended,
          body.account_banned
        )
        if (admin_email) {
          await logResolveReport(
            admin_id,
            admin_email,
            id,
            body.report_title || 'Report',
            body.resolution_notes
          )
        }
        break

      case 'dismiss':
        if (!body.reason || !admin_id) {
          return Response.json(
            { error: 'reason and admin_id are required for dismiss action' },
            { status: 400 }
          )
        }
        result = await dismissReport(id, admin_id, body.reason)
        if (admin_email) {
          await logAdminAction({
            admin_id,
            admin_email,
            action_type: 'dismiss_report',
            target_type: 'report',
            target_id: id,
            target_name: body.report_title || 'Report',
            notes: body.reason,
          })
        }
        break

      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: `Report ${action} successful`,
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
