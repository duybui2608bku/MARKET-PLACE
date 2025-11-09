import { NextRequest } from 'next/server'
import { getAllWorkers } from '@/lib/admin-workers'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/workers
 * Get all workers with filtering
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

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') as any
    const accountStatus = searchParams.get('accountStatus') as any
    const profileStatus = searchParams.get('profileStatus') as any
    const city = searchParams.get('city') || undefined
    const serviceType = searchParams.get('serviceType') || undefined
    const verified = searchParams.get('verified')
      ? searchParams.get('verified') === 'true'
      : undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters = {
      status,
      accountStatus,
      profileStatus,
      city,
      serviceType,
      verified,
      search,
    }

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters]
    )

    const result = await getAllWorkers(filters, limit, offset)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      workers: result.data.workers,
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
