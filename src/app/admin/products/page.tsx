import Link from 'next/link'
import { Plus, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminProductsClient } from './admin-products-client'
import { getProducts, getCategories } from '@/lib/queries'
import { formatPrice } from '@/lib/format'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Products</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'} · {categories.length} categories
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <AdminProductsClient products={products} categories={categories} />
    </div>
  )
}
