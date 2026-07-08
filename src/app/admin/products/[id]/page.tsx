import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ProductForm } from '@/components/admin/product-form'
import { getCategories } from '@/lib/queries'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    getCategories(),
  ])

  if (!product || product.deletedAt) notFound()

  return (
    <ProductForm
      categories={categories}
      initialData={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceCents: product.priceCents,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        stock: product.stock,
        dietaryTags: product.dietaryJson ? JSON.parse(product.dietaryJson) : [],
        galleryUrls: product.galleryJson ? JSON.parse(product.galleryJson) : [],
        ingredients: product.ingredients,
        weightGrams: product.weightGrams,
        servesPeople: product.servesPeople,
      }}
    />
  )
}
