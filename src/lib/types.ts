// Rishaad Bakers — shared app types (DB-row shapes)
// Note: Prisma generates its own types — these are the simplified shapes
// we pass to client components (no Date objects, no relations). Keeping
// them serializable is important because they cross the RSC boundary.

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string
  priceCents: number
  categoryId: string
  imageUrl: string
  galleryJson: string | null
  isAvailable: boolean
  isFeatured: boolean
  stock: number
  dietaryJson: string | null
  ingredients: string | null
  weightGrams: number | null
  servesPeople: number | null
  categoryName?: string
}

export type OrderItem = {
  id: string
  productId: string
  productName: string
  productImage: string | null
  unitPriceCents: number
  quantity: number
  subtotalCents: number
}

export type Order = {
  id: string
  orderNumber: string
  customerId: string
  status: string
  subtotalCents: number
  deliveryCents: number
  totalCents: number
  notes: string | null
  allergyNotes: string | null
  deliveryDate: string | null
  deliveryTime: string | null
  deliveryAddr: string | null
  createdAt: string
  updatedAt: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string | null
  orderItems?: OrderItem[]
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  createdAt: string
  orderCount?: number
  totalSpentCents?: number
}
