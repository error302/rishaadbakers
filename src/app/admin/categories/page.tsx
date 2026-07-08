import { AdminCategoriesClient } from './admin-categories-client'
import { getCategories, getProducts } from '@/lib/queries'

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()])
  const categoriesWithCounts = categories.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categoryId === c.id).length,
  }))
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Categories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} categories · {products.length} products
        </p>
      </div>
      <AdminCategoriesClient categories={categoriesWithCounts} />
    </div>
  )
}
