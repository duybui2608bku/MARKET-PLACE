import { NextRequest } from 'next/server'
import { getAllClients } from '@/lib/admin-clients'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/clients
 * Get all clients (employers) with filtering
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
    const accountStatus = searchParams.get('accountStatus') as any
    const verified = searchParams.get('verified')
      ? searchParams.get('verified') === 'true'
      : undefined
    const city = searchParams.get('city') || undefined
    const industry = searchParams.get('industry') || undefined
    const companySize = searchParams.get('companySize') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters = {
      accountStatus,
      verified,
      city,
      industry,
      companySize,
      search,
    }

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters]
    )

    const result = await getAllClients(filters, limit, offset)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      clients: result.data.clients,
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
