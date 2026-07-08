// Rishaad Bakers — Admin Settings API
// Reads & updates the SiteSetting key/value store.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { SETTING_KEYS } from '@/lib/settings'

async function requireAdmin() {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.siteSetting.findMany()
  const settings: Record<string, string> = {}
  for (const r of rows) settings[r.key] = r.value
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, string>
  const allowedKeys = new Set(Object.values(SETTING_KEYS))

  const updates = Object.entries(body).filter(([k, v]) => allowedKeys.has(k) && typeof v === 'string')

  for (const [key, value] of updates) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  return NextResponse.json({ success: true, updated: updates.length })
}
