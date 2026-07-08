import { ProductForm } from '@/components/admin/product-form'
import { getCategories } from '@/lib/queries'

export default async function NewProductPage() {
  const categories = await getCategories()
  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6 text-sm">
        You need at least one category before adding products.{' '}
        <a href="/admin/categories" className="font-medium text-primary underline">
          Create a category →
        </a>
      </div>
    )
  }
  return <ProductForm categories={categories} />
}
