'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice, formatDate, ORDER_STATUS_META, ORDER_STATUSES } from '@/lib/format'
import type { Order } from '@/lib/types'

export function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const matches =
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customerName ?? '').toLowerCase().includes(q) ||
          (o.customerEmail ?? '').toLowerCase().includes(q)
        if (!matches) return false
      }
      return true
    })
  }, [orders, search, statusFilter])

  const totalRevenue = filtered
    .filter((o) => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalCents, 0)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search order #, customer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="hidden text-right text-sm md:block">
            <p className="text-xs text-muted-foreground">Revenue (completed)</p>
            <p className="font-bold">{formatPrice(totalRevenue)}</p>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Placed</th>
                    <th className="px-4 py-3 font-medium">Delivery</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const meta = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.PENDING
                    return (
                      <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.deliveryDate ? formatDate(o.deliveryDate) : '—'}
                          {o.deliveryTime && <span className="block text-xs">{o.deliveryTime}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.totalCents)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((o) => {
              const meta = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.PENDING
              return (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`}>
                    <Card className="hover:shadow-warm">
                      <CardContent className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{o.orderNumber}</p>
                          <p className="truncate text-sm text-muted-foreground">{o.customerName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                          <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
                            <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(o.totalCents)}</p>
                          <p className="mt-1 text-xs text-primary">View →</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
