// Rishaad Bakers — Admin Lead by ID API
// PATCH /api/admin/leads/[id] — update status (state machine: NEW → CONTACTED → ENROLLED | LOST)
// DELETE /api/admin/leads/[id] — delete a lead

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'

const VALID_STATUSES = ['NEW', 'CONTACTED', 'ENROLLED', 'LOST']

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, notes } = body as { status?: string; notes?: string }

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Valid: ${VALID_STATUSES.join(', ')}` }, { status: 400 })
  }

  const existing = await db.lead.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const updated = await db.lead.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      // Append notes to message field as a simple approach (or could be a separate column)
      ...(notes && notes.trim() ? { message: `${existing.message ?? ''}\n\n[Admin note: ${notes.trim()}]`.trim() } : {}),
    },
  })

  return NextResponse.json({ id: updated.id, status: updated.status })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.lead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
