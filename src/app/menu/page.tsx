import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { ProductCard } from '@/components/storefront/product-card'
import { MenuClient } from './menu-client'
import { getCategories, getProducts } from '@/lib/queries'
import { Button } from '@/components/ui/button'

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams
  const categorySlug = params.category
  const search = params.q

  const [categories, products] = await Promise.all([
    getCategories(),
    categorySlug
      ? (async () => {
          const cat = await getCategories()
          const found = cat.find((c) => c.slug === categorySlug)
          return getProducts(found ? { categoryId: found.id, search } : { search })
        })()
      : getProducts({ search }),
  ])

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  return (
    <StorefrontShell>
      {/* Page header */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-10 md:px-6 md:py-14">
          <nav className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Menu</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold md:text-5xl">
            {activeCategory ? activeCategory.name : 'Our Full Menu'}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {activeCategory?.description ??
              'Browse our complete range of hand-crafted cakes, cupcakes, pastries, and treats. New seasonal items added every week.'}
          </p>
        </div>
      </section>

      <MenuClient categories={categories} products={products} activeCategorySlug={categorySlug} initialSearch={search} />
    </StorefrontShell>
  )
}
