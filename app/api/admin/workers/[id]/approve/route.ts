import { NextRequest } from 'next/server'
import { approveWorkerProfile } from '@/lib/admin-workers'
import { logApproveWorker } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * POST /api/admin/workers/[id]/approve
 * Approve worker profile
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
    const { admin_id, admin_email, worker_name } = body

    if (!admin_id || !admin_email) {
      return Response.json(
        { error: 'Admin ID and email are required' },
        { status: 400 }
      )
    }

    // Approve the worker profile
    const result = await approveWorkerProfile(id, admin_id)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    // Log the action
    await logApproveWorker(admin_id, admin_email, id, worker_name || 'Unknown')

    return Response.json({
      success: true,
      message: 'Worker profile approved successfully',
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
