// Rishaad Bakers — Admin change-password API
// POST /api/admin/change-password
// Requires current admin session. Validates current password, enforces
// minimum length on new password, hashes with bcrypt.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession, verifyPassword, hashPassword } from '@/lib/auth'
import { z } from 'zod'
import { logError } from '@/lib/notifications'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'New password must be at least 12 characters')
    .max(200, 'Password too long')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
})

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { currentPassword, newPassword } = parsed.data

    // Fetch user with current hash
    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isBcrypt = user.passwordHash.startsWith('$2')
    if (!isBcrypt) {
      // Legacy hash — force reset path: skip current-password check
      // (admin should have already been migrated by seed)
      return NextResponse.json(
        { error: 'Your password uses a legacy format. Contact your developer to reset.' },
        { status: 400 }
      )
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Don't allow reuse of current password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      )
    }

    // Hash + save
    const newHash = await hashPassword(newPassword)
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    logError(e, { endpoint: 'change-password', userId: session.user.id })
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
