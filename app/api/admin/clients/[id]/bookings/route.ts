import { NextRequest } from 'next/server'
import { getClientBookings } from '@/lib/admin-clients'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/clients/[id]/bookings
 * Get client booking history
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
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await getClientBookings(id, limit, offset)

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
