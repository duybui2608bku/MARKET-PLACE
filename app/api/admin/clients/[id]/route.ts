import { NextRequest } from 'next/server'
import { getClientById, updateEmployerProfile } from '@/lib/admin-clients'
import { updateUserAdminNotes } from '@/lib/admin-workers'

const adminSecret = process.env.ADMIN_SECRET as string | undefined

/**
 * GET /api/admin/clients/[id]
 * Get client by ID with full profile
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
    const result = await getClientById(id)

    if (!result.success) {
      return Response.json(
        { error: result.error.message },
        { status: 404 }
      )
    }

    return Response.json({ client: result.data })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/clients/[id]
 * Update client profile or user info
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

    // Separate profile updates from admin notes
    const { admin_notes, ...profileUpdates } = body

    // Update admin notes if provided
    if (admin_notes !== undefined) {
      const notesResult = await updateUserAdminNotes(id, admin_notes)
      if (!notesResult.success) {
        return Response.json(
          { error: notesResult.error.message },
          { status: 500 }
        )
      }
    }

    // Update employer profile if there are other updates
    if (Object.keys(profileUpdates).length > 0) {
      const profileResult = await updateEmployerProfile(id, profileUpdates)
      if (!profileResult.success) {
        return Response.json(
          { error: profileResult.error.message },
          { status: 500 }
        )
      }
    }

    return Response.json({ success: true, message: 'Client updated successfully' })
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
