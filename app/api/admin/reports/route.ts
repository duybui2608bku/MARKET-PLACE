import { NextRequest } from 'next/server'
import { getAllReports, createReport } from '@/lib/reports'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/reports
 * Get all reports with filtering
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
    const priority = searchParams.get('priority') || undefined
    const category = searchParams.get('category') || undefined
    const reportedType = searchParams.get('reportedType') || undefined
    const assignedTo = searchParams.get('assignedTo') || undefined
    const reporterId = searchParams.get('reporterId') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters = {
      status,
      priority,
      category,
      reportedType,
      assignedTo,
      reporterId,
    }

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) =>
        filters[key as keyof typeof filters] === undefined &&
        delete filters[key as keyof typeof filters]
    )

    const result = await getAllReports(filters, limit, offset)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      reports: result.data.reports,
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

/**
 * POST /api/admin/reports
 * Create a new report
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = await createReport(body)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      report: result.data,
    })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
