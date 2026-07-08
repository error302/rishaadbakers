import Link from 'next/link'
import { Mail, MapPin, Phone, ShoppingBag, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AdminCustomersClient } from './admin-customers-client'
import { getCustomers, getOrders } from '@/lib/queries'
import { formatPrice, formatDate } from '@/lib/format'

export default async function AdminCustomersPage() {
  const [customers, orders] = await Promise.all([getCustomers(), getOrders()])

  // Attach order history to each customer
  const customersWithOrders = customers.map((c) => ({
    ...c,
    orders: orders
      .filter((o) => o.customerId === c.id)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: o.createdAt,
      })),
  }))

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Customers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {customers.length} customers · {orders.length} total orders
        </p>
      </div>
      <AdminCustomersClient customers={customersWithOrders} />
    </div>
  )
}
