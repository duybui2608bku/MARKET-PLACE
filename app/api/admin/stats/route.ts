import { NextRequest } from 'next/server'
import { getDashboardStats, getUserGrowthStats, getRevenueStats } from '@/lib/admin-stats'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
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
    const type = searchParams.get('type') || 'dashboard'
    const days = parseInt(searchParams.get('days') || '30')

    let result

    switch (type) {
      case 'dashboard':
        result = await getDashboardStats()
        break
      case 'growth':
        result = await getUserGrowthStats(days)
        break
      case 'revenue':
        result = await getRevenueStats(days)
        break
      default:
        return Response.json(
          { error: 'Invalid stats type. Use: dashboard, growth, or revenue' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({ stats: result.data })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
