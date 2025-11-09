import { NextRequest } from 'next/server'
import { banUser, unbanUser } from '@/lib/admin-workers'
import { logBanUser, logAdminAction } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * POST /api/admin/workers/[id]/ban
 * Ban or unban user account
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

    if (action === 'ban') {
      if (!reason) {
        return Response.json(
          { error: 'Ban reason is required' },
          { status: 400 }
        )
      }

      const result = await banUser(id, admin_id, reason)

      if (!result.success) {
        return Response.json(
          { error: result.error.message },
          { status: 500 }
        )
      }

      // Log the action
      if (admin_id && admin_email) {
        await logBanUser(admin_id, admin_email, id, user_name || 'Unknown', reason)
      }

      return Response.json({
        success: true,
        message: 'User account banned successfully',
      })
    } else if (action === 'unban') {
      const result = await unbanUser(id)

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
          action_type: 'unban_user',
          target_type: 'user',
          target_id: id,
          target_name: user_name || 'Unknown',
        })
      }

      return Response.json({
        success: true,
        message: 'User account unbanned successfully',
      })
    } else {
      return Response.json(
        { error: 'Invalid action. Use "ban" or "unban"' },
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
