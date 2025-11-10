import { NextRequest } from 'next/server'
import { suspendUser, unsuspendUser } from '@/lib/admin-workers'
import { logSuspendUser, logAdminAction } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * POST /api/admin/workers/[id]/suspend
 * Suspend or unsuspend user account
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin authentication
    if (adminSecret) {
      const provided = req.headers.get('x-admin-secret')
      if (provided !== adminSecret) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { id } = params
    const body = await req.json()
    const { action, reason, admin_id, admin_email, user_name } = body

    if (action === 'suspend') {
      if (!reason) {
        return Response.json(
          { error: 'Suspension reason is required' },
          { status: 400 }
        )
      }

      const result = await suspendUser(id, admin_id, reason)

      if (!result.success) {
        return Response.json(
          { error: result.error.message },
          { status: 500 }
        )
      }

      // Log the action
      if (admin_id && admin_email) {
        await logSuspendUser(admin_id, admin_email, id, user_name || 'Unknown', reason)
      }

      return Response.json({
        success: true,
        message: 'User account suspended successfully',
      })
    } else if (action === 'unsuspend') {
      const result = await unsuspendUser(id)

      if (!result.success) {
        return Response.json(
          { error: result.error.message },
          { status: 500 }
        )
      }

      // Log the action
      if (admin_id && admin_email) {
        await logAdminAction({
          admin_id,
          admin_email,
          action_type: 'unsuspend_user',
          target_type: 'user',
          target_id: id,
          target_name: user_name || 'Unknown',
        })
      }

      return Response.json({
        success: true,
        message: 'User account unsuspended successfully',
      })
    } else {
      return Response.json(
        { error: 'Invalid action. Use "suspend" or "unsuspend"' },
        { status: 400 }
      )
    }
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
