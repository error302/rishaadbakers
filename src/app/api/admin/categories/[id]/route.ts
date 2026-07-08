// Rishaad Bakers — Admin Category by ID API

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categorySchema } from '@/lib/validations'
import { getAuthSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const existing = await db.category.findUnique({ where: { slug: data.slug } })
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const category = await db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      sortOrder: data.sortOrder ?? 0,
    },
  })
  return NextResponse.json({ id: category.id })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // Check no products attached
  const count = await db.product.count({ where: { categoryId: id, deletedAt: null } })
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} products still in this category. Move them first.` },
      { status: 400 }
    )
  }
  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
