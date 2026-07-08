import { AdminOrdersClient } from './admin-orders-client'
import { getOrders, getCustomers } from '@/lib/queries'

export default async function AdminOrdersPage() {
  const [orders, customers] = await Promise.all([getOrders(), getCustomers()])
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} total orders · {orders.filter(o => o.status === 'PENDING').length} pending ·{' '}
          {orders.filter(o => o.status === 'PROCESSING').length} processing
        </p>
      </div>
      <AdminOrdersClient orders={orders} />
    </div>
  )
}
