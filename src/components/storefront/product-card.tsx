'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Cake } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem)
  const dietary: string[] = product.dietaryJson ? JSON.parse(product.dietaryJson) : []
  const isLowStock = product.stock > 0 && product.stock <= 3
  const isOutOfStock = product.stock === 0 || !product.isAvailable

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      maxStock: product.stock,
    })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all hover:shadow-warm-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        {product.isFeatured && !isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground shadow-sm">
            Featured
          </span>
        )}
        {isOutOfStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-background">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1">
          {dietary.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
        </div>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 font-medium leading-tight hover:text-primary transition-colors">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        {product.servesPeople && product.servesPeople > 1 && (
          <p className="mt-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <Cake className="h-3 w-3" />
            Serves {product.servesPeople}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t border-border/50 p-4 pt-3">
        <div className="flex flex-col leading-none">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">From</span>
          <span className="text-base font-bold text-foreground">{formatPrice(product.priceCents)}</span>
        </div>
        <Button size="sm" onClick={handleAdd} disabled={isOutOfStock} className="h-8">
          {isOutOfStock ? 'Sold Out' : 'Add'}
        </Button>
      </CardFooter>
    </Card>
  )
}
