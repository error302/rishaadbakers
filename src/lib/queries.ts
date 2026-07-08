// Rishaad Bakers — data-access layer for storefront & admin
// Per Backend Architect pattern: keep queries centralized, return plain
// serializable objects (no Date — convert to ISO string at the boundary).

import { db } from '@/lib/db'
import type { Category, Product, Order, OrderItem, Customer } from '@/lib/types'

// ── Catalog ──────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const rows = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    imageUrl: r.imageUrl,
    sortOrder: r.sortOrder,
  }))
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const r = await db.category.findUnique({ where: { slug } })
  if (!r) return null
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    imageUrl: r.imageUrl,
    sortOrder: r.sortOrder,
  }
}

export async function getProducts(opts?: {
  categoryId?: string
  featured?: boolean
  search?: string
  limit?: number
}): Promise<Product[]> {
  const where: Record<string, unknown> = { deletedAt: null }
  if (opts?.categoryId) where.categoryId = opts.categoryId
  if (opts?.featured) where.isFeatured = true
  if (opts?.search) where.name = { contains: opts.search }

  const rows = await db.product.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: opts?.limit,
    include: { category: true },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    priceCents: r.priceCents,
    categoryId: r.categoryId,
    imageUrl: r.imageUrl,
    galleryJson: r.galleryJson,
    isAvailable: r.isAvailable,
    isFeatured: r.isFeatured,
    stock: r.stock,
    dietaryJson: r.dietaryJson,
    ingredients: r.ingredients,
    weightGrams: r.weightGrams,
    servesPeople: r.servesPeople,
    categoryName: r.category.name,
  }))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const r = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  })
  if (!r || r.deletedAt) return null
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    priceCents: r.priceCents,
    categoryId: r.categoryId,
    imageUrl: r.imageUrl,
    galleryJson: r.galleryJson,
    isAvailable: r.isAvailable,
    isFeatured: r.isFeatured,
    stock: r.stock,
    dietaryJson: r.dietaryJson,
    ingredients: r.ingredients,
    weightGrams: r.weightGrams,
    servesPeople: r.servesPeople,
    categoryName: r.category.name,
  }
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      deletedAt: null,
      isAvailable: true,
    },
    take: limit,
    orderBy: { isFeatured: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    priceCents: r.priceCents,
    categoryId: r.categoryId,
    imageUrl: r.imageUrl,
    galleryJson: r.galleryJson,
    isAvailable: r.isAvailable,
    isFeatured: r.isFeatured,
    stock: r.stock,
    dietaryJson: r.dietaryJson,
    ingredients: r.ingredients,
    weightGrams: r.weightGrams,
    servesPeople: r.servesPeople,
  }))
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function getOrders(opts?: {
  status?: string
  limit?: number
  customerId?: string
}): Promise<Order[]> {
  const where: Record<string, unknown> = {}
  if (opts?.status) where.status = opts.status
  if (opts?.customerId) where.customerId = opts.customerId

  const rows = await db.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: opts?.limit,
    include: { customer: true, orderItems: true },
  })
  return rows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    customerId: r.customerId,
    status: r.status,
    subtotalCents: r.subtotalCents,
    deliveryCents: r.deliveryCents,
    totalCents: r.totalCents,
    notes: r.notes,
    allergyNotes: r.allergyNotes,
    deliveryDate: r.deliveryDate?.toISOString() ?? null,
    deliveryTime: r.deliveryTime,
    deliveryAddr: r.deliveryAddr,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    customerName: r.customer.name,
    customerEmail: r.customer.email,
    customerPhone: r.customer.phone,
    orderItems: r.orderItems.map((oi) => ({
      id: oi.id,
      productId: oi.productId,
      productName: oi.productName,
      productImage: oi.productImage,
      unitPriceCents: oi.unitPriceCents,
      quantity: oi.quantity,
      subtotalCents: oi.subtotalCents,
    })),
  }))
}

export async function getOrderById(id: string): Promise<Order | null> {
  const r = await db.order.findUnique({
    where: { id },
    include: { customer: true, orderItems: true },
  })
  if (!r) return null
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    customerId: r.customerId,
    status: r.status,
    subtotalCents: r.subtotalCents,
    deliveryCents: r.deliveryCents,
    totalCents: r.totalCents,
    notes: r.notes,
    allergyNotes: r.allergyNotes,
    deliveryDate: r.deliveryDate?.toISOString() ?? null,
    deliveryTime: r.deliveryTime,
    deliveryAddr: r.deliveryAddr,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    customerName: r.customer.name,
    customerEmail: r.customer.email,
    customerPhone: r.customer.phone,
    orderItems: r.orderItems.map((oi) => ({
      id: oi.id,
      productId: oi.productId,
      productName: oi.productName,
      productImage: oi.productImage,
      unitPriceCents: oi.unitPriceCents,
      quantity: oi.quantity,
      subtotalCents: oi.subtotalCents,
    })),
  }
}

// ── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const rows = await db.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        select: { id: true, totalCents: true, status: true },
      },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    address: r.address,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    orderCount: r.orders.length,
    totalSpentCents: r.orders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((sum, o) => sum + o.totalCents, 0),
  }))
}

// ── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [totalOrders, totalProducts, totalCustomers, allOrders, lowStock] = await Promise.all([
    db.order.count(),
    db.product.count({ where: { deletedAt: null } }),
    db.customer.count(),
    db.order.findMany({
      select: { status: true, totalCents: true, createdAt: true },
    }),
    db.product.findMany({
      where: { deletedAt: null, stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      include: { category: true },
    }),
  ])

  const revenueCents = allOrders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalCents, 0)

  const pendingCents = allOrders
    .filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING')
    .reduce((sum, o) => sum + o.totalCents, 0)

  const statusCounts = {
    PENDING: allOrders.filter((o) => o.status === 'PENDING').length,
    PROCESSING: allOrders.filter((o) => o.status === 'PROCESSING').length,
    COMPLETED: allOrders.filter((o) => o.status === 'COMPLETED').length,
    CANCELLED: allOrders.filter((o) => o.status === 'CANCELLED').length,
    REFUNDED: allOrders.filter((o) => o.status === 'REFUNDED').length,
  }

  // Last 7 days revenue
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const dailyRevenue: { date: string; cents: number }[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(sevenDaysAgo)
    day.setDate(day.getDate() + i)
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const cents = allOrders
      .filter((o) => {
        const created = new Date(o.createdAt)
        return (
          created >= day &&
          created < nextDay &&
          (o.status === 'COMPLETED' || o.status === 'PROCESSING')
        )
      })
      .reduce((sum, o) => sum + o.totalCents, 0)
    dailyRevenue.push({ date: day.toISOString(), cents })
  }

  return {
    totalOrders,
    totalProducts,
    totalCustomers,
    revenueCents,
    pendingCents,
    statusCounts,
    dailyRevenue,
    lowStock: lowStock.map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      categoryName: p.category.name,
    })),
  }
}
