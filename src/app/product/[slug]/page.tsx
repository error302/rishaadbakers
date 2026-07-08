import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Cake, Check, Leaf, ShieldCheck, Truck, Users } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { ProductCard } from '@/components/storefront/product-card'
import { ProductDetailClient } from './product-detail-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getProductBySlug, getRelatedProducts, getCategories } from '@/lib/queries'
import { formatPrice } from '@/lib/format'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, categories] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId, 4),
    getCategories(),
  ])

  const category = categories.find((c) => c.id === product.categoryId)
  const gallery: string[] = product.galleryJson ? JSON.parse(product.galleryJson) : [product.imageUrl]
  const dietary: string[] = product.dietaryJson ? JSON.parse(product.dietaryJson) : []
  const isOutOfStock = product.stock === 0 || !product.isAvailable
  const isLowStock = product.stock > 0 && product.stock <= 3

  return (
    <StorefrontShell>
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/menu" className="hover:text-foreground">Menu</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/menu?category=${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
                unoptimized
              />
              {product.isFeatured && (
                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-sm">
                  Featured
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="120px" className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {category && (
                  <Link href={`/menu?category=${category.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer">{category.name}</Badge>
                  </Link>
                )}
                {dietary.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    <Leaf className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="mt-3 font-serif text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-primary">{formatPrice(product.priceCents)}</span>
                {product.servesPeople && product.servesPeople > 1 && (
                  <span className="text-sm text-muted-foreground">
                    serves {product.servesPeople}
                  </span>
                )}
              </div>
            </div>

            <p className="text-base leading-relaxed text-foreground/90">{product.description}</p>

            {/* Stock indicator */}
            {isOutOfStock ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Currently sold out — check back tomorrow morning.
              </div>
            ) : isLowStock ? (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                Only {product.stock} left — order soon!
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <Check className="mr-1.5 inline h-4 w-4" />
                In stock — ready to bake.
              </div>
            )}

            {/* Add to cart (client component) */}
            <ProductDetailClient product={product} isOutOfStock={isOutOfStock} />

            <Separator />

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {product.weightGrams && (
                <div className="flex items-center gap-2 text-sm">
                  <Cake className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{product.weightGrams}g</p>
                  </div>
                </div>
              )}
              {product.servesPeople && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Serves</p>
                    <p className="font-medium">{product.servesPeople} {product.servesPeople === 1 ? 'person' : 'people'}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium">Local, $5</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Freshness</p>
                  <p className="font-medium">Baked to order</p>
                </div>
              </div>
            </div>

            {product.ingredients && (
              <div>
                <h2 className="mb-2 text-sm font-semibold">Ingredients</h2>
                <p className="text-sm text-muted-foreground">{product.ingredients}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-24">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">You may also like</p>
                <h2 className="mt-2 font-serif text-2xl font-bold md:text-3xl">More from our bakery</h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/menu">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </StorefrontShell>
  )
}
