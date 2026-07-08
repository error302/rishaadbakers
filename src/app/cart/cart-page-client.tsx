'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StorefrontShellClient } from '@/components/storefront/storefront-shell'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'
import { getSiteSettings, type SiteSettings } from '@/lib/settings'

type CartPageProps = {
  settings: SiteSettings
}

export function CartPageClient({ settings }: CartPageProps) {
  const { items, removeItem, updateQuantity, subtotalCents, clear } = useCart()

  const deliveryCents =
    subtotalCents() === 0 || subtotalCents() >= settings.freeDeliveryThresholdCents
      ? 0
      : settings.deliveryFeeCents
  const taxCents = Math.round(subtotalCents() * 0.0) // food is tax-exempt in many jurisdictions; configurable
  const totalCents = subtotalCents() + deliveryCents + taxCents

  return (
    <StorefrontShellClient settings={settings}>
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
          <nav className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Cart</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold md:text-4xl">Your Shopping Cart</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        {items.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-9 w-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif text-xl font-bold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our menu and add something sweet to your cart.
              </p>
            </div>
            <Button asChild>
              <Link href="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b border-border py-4">
                  <CardTitle className="font-serif text-lg">
                    {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul>
                    {items.map((item, idx) => (
                      <li
                        key={item.productId}
                        className={`flex gap-4 p-4 ${idx > 0 ? 'border-t border-border' : ''}`}
                      >
                        <Link
                          href={`/product/${item.slug}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                            unoptimized
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/product/${item.slug}`}
                                className="font-medium hover:text-primary"
                              >
                                {item.name}
                              </Link>
                              <p className="mt-0.5 text-sm text-muted-foreground">
                                {formatPrice(item.priceCents)} each
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-md border border-border">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock}
                                className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="justify-between border-t border-border p-4">
                  <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-destructive">
                    <X className="mr-1 h-4 w-4" />
                    Clear cart
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/menu">Continue shopping</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader className="border-b border-border py-4">
                  <CardTitle className="font-serif text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotalCents())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    {deliveryCents === 0 ? (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(deliveryCents)}</span>
                    )}
                  </div>
                  {subtotalCents() < settings.freeDeliveryThresholdCents && (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                      Add {formatPrice(settings.freeDeliveryThresholdCents - subtotalCents())} more
                      to get free delivery.
                    </p>
                  )}
                  <Separator />
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-serif text-2xl font-bold text-primary">
                      {formatPrice(totalCents)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2 border-t border-border p-4">
                  <Button asChild className="w-full gap-1.5">
                    <Link href="/checkout">
                      Proceed to checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Allergies? Add a note at checkout — we take dietary needs seriously.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </section>
    </StorefrontShellClient>
  )
}
