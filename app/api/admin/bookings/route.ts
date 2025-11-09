import { NextRequest } from 'next/server'
import { getAllBookings } from '@/lib/admin-bookings'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/bookings
 * Get all bookings with filtering
 */
export async function GET(req: NextRequest) {
  try {
    // Admin authentication
    if (adminSecret) {
      const provided = req.headers.get('x-admin-secret')
      if (provided !== adminSecret) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const workerId = searchParams.get('workerId') || undefined
    const employerId = searchParams.get('employerId') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters = {
      status,
      workerId,
      employerId,
      startDate,
      endDate,
    }

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters]
    )

    const result = await getAllBookings(filters, limit, offset)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      bookings: result.data.bookings,
      total: result.data.total,
      limit,
      offset,
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
