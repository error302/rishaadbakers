// Rishaad Bakers — Admin Product by ID API
// PUT (update), DELETE (soft-delete)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { getAuthSession } from '@/lib/auth'

async function requireAdminSession() {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true },
  })
  if (!product || product.deletedAt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    ...product,
    dietaryTags: product.dietaryJson ? JSON.parse(product.dietaryJson) : [],
    galleryUrls: product.galleryJson ? JSON.parse(product.galleryJson) : [],
    categoryName: product.category.name,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    // Check slug uniqueness (excluding current product)
    const existing = await db.product.findUnique({ where: { slug: data.slug } })
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        priceCents: data.priceCents,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80',
        galleryJson: data.galleryUrls || JSON.stringify([]),
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        stock: data.stock,
        dietaryJson: data.dietaryTags || JSON.stringify([]),
        ingredients: data.ingredients || null,
        weightGrams: typeof data.weightGrams === 'number' && !isNaN(data.weightGrams) ? data.weightGrams : null,
        servesPeople: typeof data.servesPeople === 'number' && !isNaN(data.servesPeople) ? data.servesPeople : null,
      },
    })

    return NextResponse.json({ id: product.id, slug: product.slug })
  } catch (e) {
    console.error('Update product error:', e)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  // Soft-delete per Backend Architect rule (never hard-delete products that may be referenced by orders)
  await db.product.update({
    where: { id },
    data: { deletedAt: new Date(), isAvailable: false },
  })
  return NextResponse.json({ success: true })
}
