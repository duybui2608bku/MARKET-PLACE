import { NextRequest } from 'next/server'
import { issueWarningToClient } from '@/lib/admin-clients'
import { logAdminAction } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * POST /api/admin/clients/[id]/warning
 * Issue warning to client
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
    const { reason, admin_id, admin_email, client_name } = body

    if (!reason) {
      return Response.json(
        { error: 'Warning reason is required' },
        { status: 400 }
      )
    }

    // Issue warning
    const result = await issueWarningToClient(id, reason)

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
        action_type: 'other',
        target_type: 'user',
        target_id: id,
        target_name: client_name || 'Unknown',
        notes: `Issued warning: ${reason}`,
      })
    }

    return Response.json({
      success: true,
      message: 'Warning issued successfully',
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
