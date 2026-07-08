import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, CheckCircle2, Clock, Home, MapPin, Package, ShoppingBag } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getOrderById } from '@/lib/queries'
import { formatPrice, formatDate, ORDER_STATUS_META } from '@/lib/format'

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  if (!id) notFound()
  const order = await getOrderById(id)
  if (!order) notFound()

  const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING

  return (
    <StorefrontShell>
      <section className="container mx-auto px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl">
          {/* Success banner */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Order received</p>
              <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">Thank you for your order!</h1>
              <p className="mt-3 text-muted-foreground">
                We&rsquo;ve received your order and our bakers are getting ready to start. A confirmation
                has been sent to <span className="font-medium text-foreground">{order.customerEmail}</span>.
              </p>
            </div>
          </div>

          {/* Order card */}
          <Card className="mt-10 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Order number</p>
                <p className="font-serif text-2xl font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Items */}
              <ul className="divide-y divide-border">
                {order.orderItems?.map((item) => (
                  <li key={item.id} className="flex gap-4 p-5">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.productImage && (
                        <Image src={item.productImage} alt={item.productName} fill sizes="80px" className="object-cover" unoptimized />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.unitPriceCents)} × {item.quantity}
                      </p>
                      <p className="mt-auto text-sm font-semibold">{formatPrice(item.subtotalCents)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className="space-y-2 border-t border-border px-5 py-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  {order.deliveryCents === 0 ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                  ) : (
                    <span className="font-medium">{formatPrice(order.deliveryCents)}</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <span className="font-semibold">Total paid</span>
                  <span className="font-serif text-2xl font-bold text-primary">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>
              </div>

              {/* Delivery info */}
              <div className="grid gap-4 border-t border-border bg-secondary/20 p-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Delivery date</p>
                    <p className="text-sm font-medium">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : 'To be confirmed'}
                    </p>
                    {order.deliveryTime && (
                      <p className="text-xs text-muted-foreground">around {order.deliveryTime}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Delivery address</p>
                    <p className="text-sm font-medium">{order.deliveryAddr}</p>
                  </div>
                </div>
              </div>

              {/* Allergy alert */}
              {order.allergyNotes && (
                <div className="flex items-start gap-3 border-t border-amber-500/30 bg-amber-500/5 p-5 text-amber-800 dark:text-amber-200">
                  <Package className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide">Allergy notes</p>
                    <p className="text-sm">{order.allergyNotes}</p>
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="flex items-start gap-3 border-t border-border p-5">
                  <ShoppingBag className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Order notes</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next steps */}
          <div className="mt-8 rounded-2xl border border-border bg-secondary/20 p-6">
            <h2 className="font-serif text-lg font-semibold">What happens next?</h2>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span className="pt-0.5">We&rsquo;ll review your order and confirm the delivery time by email within 2 hours.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span className="pt-0.5">Our bakers will start preparing your order the day before delivery.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span className="pt-0.5">We&rsquo;ll deliver to your address on {order.deliveryDate ? formatDate(order.deliveryDate) : 'the scheduled date'} around {order.deliveryTime ?? 'the agreed time'}.</span>
              </li>
            </ol>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/menu">
                <Home className="h-4 w-4" />
                Back to menu
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/contact">
                <Clock className="h-4 w-4" />
                Contact us about this order
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
