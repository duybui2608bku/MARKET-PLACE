import { NextRequest } from 'next/server'
import { getBookingById, updateBookingStatus } from '@/lib/admin-bookings'
import { logAdminAction } from '@/lib/admin-actions'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/bookings/[id]
 * Get booking by ID
 */
export async function GET(
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
    const result = await getBookingById(id)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 404 }
      )
    }

    return Response.json({ booking: result.data })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/bookings/[id]
 * Update booking status
 */
export async function PUT(
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
    const { status, admin_id, admin_email } = body

    if (!status) {
      return Response.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const result = await updateBookingStatus(id, status)

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
        action_type: 'update_booking_status',
        target_type: 'booking',
        target_id: id,
        target_name: `Booking ${id.substring(0, 8)}`,
        changes: { status },
      })
    }

    return Response.json({
      success: true,
      message: 'Booking status updated successfully',
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
