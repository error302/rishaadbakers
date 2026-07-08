'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StorefrontShellClient } from '@/components/storefront/storefront-shell'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations'
import type { SiteSettings } from '@/lib/settings'
import { toast } from 'sonner'

type CheckoutClientProps = {
  settings: SiteSettings
}

export function CheckoutClient({ settings }: CheckoutClientProps) {
  const router = useRouter()
  const { items, subtotalCents, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) })

  const deliveryCents =
    subtotalCents() === 0 || subtotalCents() >= settings.freeDeliveryThresholdCents
      ? 0
      : settings.deliveryFeeCents
  const totalCents = subtotalCents() + deliveryCents

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + 60)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            imageUrl: i.imageUrl,
            priceCents: i.priceCents,
            quantity: i.quantity,
          })),
          subtotalCents: subtotalCents(),
          deliveryCents,
          totalCents,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Checkout failed' }))
        throw new Error(err.error ?? 'Checkout failed')
      }
      const { orderId, orderNumber } = await res.json()
      clear()
      toast.success(`Order ${orderNumber} placed!`)
      router.push(`/order-confirmation?id=${orderId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <StorefrontShellClient settings={settings}>
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border p-10">
            <h1 className="font-serif text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add some cakes first — then come back here.
            </p>
            <Button asChild className="mt-5">
              <Link href="/menu">Browse the menu</Link>
            </Button>
          </div>
        </section>
      </StorefrontShellClient>
    )
  }

  return (
    <StorefrontShellClient settings={settings}>
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-10">
          <nav className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-foreground">Cart</Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold md:text-4xl">Checkout</h1>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
          {/* Left: form */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="font-serif text-lg">Contact & delivery</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 py-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="customerName">Full name *</Label>
                    <Input id="customerName" {...register('customerName')} placeholder="Your full name" />
                    {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input id="customerEmail" type="email" {...register('customerEmail')} placeholder="you@example.com" />
                    {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="customerPhone">Phone *</Label>
                    <Input id="customerPhone" {...register('customerPhone')} placeholder="+1 (555) 555-5555" />
                    {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="deliveryDate">Delivery / pickup date *</Label>
                    <Input id="deliveryDate" type="date" min={minDateStr} max={maxDateStr} {...register('deliveryDate')} />
                    {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <Label htmlFor="deliveryTime">Preferred time *</Label>
                    <Input id="deliveryTime" type="time" {...register('deliveryTime')} />
                    {errors.deliveryTime && <p className="text-xs text-destructive">{errors.deliveryTime.message}</p>}
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="deliveryAddress">Delivery address *</Label>
                  <Textarea id="deliveryAddress" rows={3} {...register('deliveryAddress')} placeholder="Street, apartment, city, ZIP" />
                  {errors.deliveryAddress && <p className="text-xs text-destructive">{errors.deliveryAddress.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Allergies & dietary needs
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 py-5">
                <div className="grid gap-1.5">
                  <Label htmlFor="allergyNotes">Allergy notes</Label>
                  <Textarea
                    id="allergyNotes"
                    rows={2}
                    {...register('allergyNotes')}
                    placeholder="e.g. severe peanut allergy — please ensure no cross-contamination"
                  />
                  <p className="text-xs text-muted-foreground">
                    A missed food allergy can be a medical emergency — please tell us about every allergy in your party.
                  </p>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Order notes (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    {...register('notes')}
                    placeholder="Cake message, delivery instructions, gift note..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="font-serif text-lg">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" unoptimized />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(item.priceCents)} each</p>
                      </div>
                      <span className="self-center text-sm font-medium">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotalCents())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    {deliveryCents === 0 ? (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Free</span>
                    ) : (
                      <span className="font-medium">{formatPrice(deliveryCents)}</span>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-serif text-2xl font-bold text-primary">
                    {formatPrice(totalCents)}
                  </span>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'Placing order...' : `Place order · ${formatPrice(totalCents)}`}
                </Button>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Your information is private and never shared.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    Free delivery over {formatPrice(settings.freeDeliveryThresholdCents)}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </section>
    </StorefrontShellClient>
  )
}
