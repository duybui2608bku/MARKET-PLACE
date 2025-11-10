import { NextRequest } from 'next/server'
import { rejectWorkerProfile } from '@/lib/admin-workers'
import { logRejectWorker } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * POST /api/admin/workers/[id]/reject
 * Reject worker profile
 */
export async function POST(
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
    const { reason, admin_id, admin_email, worker_name } = body

    if (!reason) {
      return Response.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Reject the worker profile
    const result = await rejectWorkerProfile(id, reason)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    // Log the action if admin info provided
    if (admin_id && admin_email) {
      await logRejectWorker(admin_id, admin_email, id, worker_name || 'Unknown', reason)
    }

    return Response.json({
      success: true,
      message: 'Worker profile rejected successfully',
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
