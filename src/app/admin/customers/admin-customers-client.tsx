'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone, Search, ShoppingBag, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice, formatDate, relativeTime, ORDER_STATUS_META } from '@/lib/format'

type CustomerOrder = {
  id: string
  orderNumber: string
  status: string
  totalCents: number
  createdAt: string
}

type Customer = {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  notes: string | null
  createdAt: string
  orderCount: number
  totalSpentCents: number
  orders: CustomerOrder[]
}

export function AdminCustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone ?? '').toLowerCase().includes(q)
    )
  }, [customers, search])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No customers found</p>
            <p className="text-sm text-muted-foreground">New customers will appear here after their first order.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Contact</th>
                  <th className="px-4 py-3 text-center font-medium">Orders</th>
                  <th className="px-4 py-3 text-right font-medium">Total spent</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Since</th>
                  <th className="px-4 py-3 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      {c.phone ? (
                        <p className="text-muted-foreground">{c.phone}</p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{c.orderCount}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(c.totalSpentCents)}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(c)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Contact info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${selected.email}`} className="text-sm hover:text-primary">{selected.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{selected.phone ?? '—'}</p>
                  </div>
                </div>
                {selected.address && (
                  <div className="flex items-start gap-3 rounded-lg border border-border p-3 sm:col-span-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm">{selected.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="font-serif text-2xl font-bold text-primary">{selected.orderCount}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="font-serif text-2xl font-bold text-primary">{formatPrice(selected.totalSpentCents)}</p>
                  <p className="text-xs text-muted-foreground">Total spent</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="font-serif text-2xl font-bold text-primary">
                    {selected.orderCount > 0 ? formatPrice(Math.round(selected.totalSpentCents / selected.orderCount)) : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg / order</p>
                </div>
              </div>

              {/* Order history */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-serif text-sm font-semibold">
                  <ShoppingBag className="h-4 w-4" />
                  Order history ({selected.orders.length})
                </h3>
                {selected.orders.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </p>
                ) : (
                  <ul className="max-h-64 space-y-2 overflow-y-auto">
                    {selected.orders.map((o) => {
                      const meta = ORDER_STATUS_META[o.status] ?? ORDER_STATUS_META.PENDING
                      return (
                        <li key={o.id}>
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{o.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">{relativeTime(o.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
                                <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                                {meta.label}
                              </span>
                              <span className="font-semibold">{formatPrice(o.totalCents)}</span>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
