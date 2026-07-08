'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductCard } from '@/components/storefront/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import type { Category, Product } from '@/lib/types'

type MenuClientProps = {
  categories: Category[]
  products: Product[]
  activeCategorySlug?: string
  initialSearch?: string
}

export function MenuClient({ categories, products, activeCategorySlug, initialSearch }: MenuClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch ?? '')

  // Local filtering for snappy UX (server already filtered by category)
  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    )
  }, [products, search])

  const setCategory = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) params.set('category', slug)
    else params.delete('category')
    if (search) params.set('q', search)
    router.push(`/menu${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <section className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar / mobile filter */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="mb-4">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cakes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </label>
            </div>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Categories
            </h2>
            <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-0.5">
              <button
                onClick={() => setCategory(null)}
                className={cn(
                  'rounded-md px-3 py-2 text-left text-sm transition-colors',
                  !activeCategorySlug
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground/70 hover:bg-accent/10 hover:text-foreground'
                )}
              >
                All items
                <span className="ml-1 text-xs opacity-70">({products.length})</span>
              </button>
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length
                const active = activeCategorySlug === c.slug
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.slug)}
                    className={cn(
                      'rounded-md px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground/70 hover:bg-accent/10 hover:text-foreground'
                    )}
                  >
                    {c.name}
                    {activeCategorySlug && <span className="ml-1 text-xs opacity-70">({count})</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'item' : 'items'}
              {activeCategorySlug && (
                <button
                  onClick={() => setCategory(null)}
                  className="ml-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <X className="h-3 w-3" /> clear filter
                </button>
              )}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <Search className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium">No items found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different search or clear your filters.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/menu">View all items</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
