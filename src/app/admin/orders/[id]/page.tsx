import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Mail, MapPin, Phone, User, AlertTriangle, Package, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { OrderStatusActions } from './order-status-actions'
import { getOrderById, getCustomers } from '@/lib/queries'
import { formatPrice, formatDateTime, formatDate, ORDER_STATUS_META, canTransition, ORDER_TRANSITIONS } from '@/lib/format'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING
  const allowedTransitions = ORDER_TRANSITIONS[order.status] ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold">{order.orderNumber}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/customers?id=${order.customerId}`}>View customer</Link>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main: items + status actions */}
        <div className="space-y-5 lg:col-span-2">
          {/* Status actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Order status</CardTitle>
            </CardHeader>
            <CardContent>
              {allowedTransitions.length > 0 ? (
                <OrderStatusActions orderId={order.id} currentStatus={order.status} allowed={allowedTransitions} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  This order is in a final state — no further status changes are allowed.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-serif text-lg">
                <Package className="h-4 w-4" />
                Items ({order.orderItems?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {order.orderItems?.map((item) => (
                  <li key={item.id} className="flex gap-4 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.productImage && (
                        <Image src={item.productImage} alt={item.productName} fill sizes="64px" className="object-cover" unoptimized />
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
              <div className="space-y-2 border-t border-border p-4 text-sm">
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
                <Separator />
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-serif text-xl font-bold text-primary">{formatPrice(order.totalCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(order.notes || order.allergyNotes) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {order.allergyNotes && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-serif text-base text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      Allergy notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-800 dark:text-amber-200">{order.allergyNotes}</p>
                  </CardContent>
                </Card>
              )}
              {order.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 font-serif text-base">
                      <MessageSquare className="h-4 w-4" />
                      Order notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: customer + delivery info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${order.customerEmail}`} className="hover:text-primary">
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-primary">
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">
                    {order.deliveryDate ? formatDate(order.deliveryDate) : 'Not scheduled'}
                  </p>
                  {order.deliveryTime && <p className="text-xs text-muted-foreground">{order.deliveryTime}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <p>{order.deliveryAddr ?? 'No address provided'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
