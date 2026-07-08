'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'

export function ProductDetailClient({ product, isOutOfStock }: { product: Product; isOutOfStock: boolean }) {
  const [qty, setQty] = useState(1)
  const addItem = useCart((s) => s.addItem)

  const handleAdd = () => {
    if (isOutOfStock) return
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      priceCents: product.priceCents,
      maxStock: product.stock,
    }, qty)
    toast.success(`${qty} × ${product.name} added to cart`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center rounded-lg border border-border">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-base font-semibold">{qty}</span>
        <button
          onClick={() => setQty(Math.min(qty + 1, product.stock || 99))}
          disabled={qty >= (product.stock || 99)}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button
        size="lg"
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="h-12 flex-1 gap-2 text-base"
      >
        <ShoppingBag className="h-4 w-4" />
        {isOutOfStock ? 'Sold Out' : `Add to cart · ${formatPrice(product.priceCents * qty)}`}
      </Button>
    </div>
  )
}
