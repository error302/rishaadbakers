// Rishaad Bakers — Admin Products API
// CRUD operations for products (admin-only).
// Per Backend Architect: idempotent mutations, server-side validation,
// soft deletes (we set deletedAt instead of hard-deleting).

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productSchema } from '@/lib/validations'
import { getAuthSession } from '@/lib/auth'

async function requireAdminSession() {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

// GET /api/admin/products — list all products (including soft-deleted)
export async function GET() {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const products = await db.product.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceCents: p.priceCents,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      isFeatured: p.isFeatured,
      stock: p.stock,
      dietaryTags: p.dietaryJson ? JSON.parse(p.dietaryJson) : [],
      ingredients: p.ingredients,
      weightGrams: p.weightGrams,
      servesPeople: p.servesPeople,
      createdAt: p.createdAt.toISOString(),
    }))
  )
}

// POST /api/admin/products — create a new product
export async function POST(req: NextRequest) {
  const session = await requireAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }

    const product = await db.product.create({
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

    return NextResponse.json({ id: product.id, slug: product.slug }, { status: 201 })
  } catch (e) {
    console.error('Create product error:', e)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
