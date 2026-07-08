import Link from 'next/link'
import { ArrowRight, ArrowUpRight, DollarSign, Package, ShoppingCart, Users, AlertTriangle, TrendingUp, Cake, UserPlus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardCharts } from './dashboard-charts'
import { getDashboardStats, getOrders } from '@/lib/queries'
import { formatPrice, formatDate, relativeTime, ORDER_STATUS_META } from '@/lib/format'
import { db } from '@/lib/db'

export default async function AdminDashboardPage() {
  const [stats, recentOrders, newLeadsCount] = await Promise.all([
    getDashboardStats(),
    getOrders({ limit: 6 }),
    db.lead.count({ where: { status: 'NEW' } }),
  ])

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="font-serif text-2xl font-bold md:text-3xl">Welcome back 👋</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&rsquo;s what&rsquo;s happening at the bakery today.
        </p>
      </div>

      {/* New leads alert */}
      {newLeadsCount > 0 && (
        <Card className="border-accent/40 bg-accent/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {newLeadsCount} new enrolment {newLeadsCount === 1 ? 'enquiry' : 'enquiries'} awaiting response
                </p>
                <p className="text-sm text-muted-foreground">
                  Follow up with prospective students from the Baking Class page.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/admin/leads">
                View leads
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Revenue</p>
                <p className="mt-2 font-serif text-2xl font-bold">{formatPrice(stats.revenueCents)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" />
                  From completed orders
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Orders</p>
                <p className="mt-2 font-serif text-2xl font-bold">{stats.totalOrders}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {stats.statusCounts.PROCESSING} processing · {stats.statusCounts.PENDING} pending
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Products</p>
                <p className="mt-2 font-serif text-2xl font-bold">{stats.totalProducts}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {stats.lowStock.length} low on stock
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customers</p>
                <p className="mt-2 font-serif text-2xl font-bold">{stats.totalCustomers}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {formatPrice(stats.pendingCents)} pending revenue
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + low stock */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-lg">Revenue (last 7 days)</CardTitle>
              <CardDescription>Daily totals from completed &amp; processing orders</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <DashboardCharts dailyRevenue={stats.dailyRevenue} statusCounts={stats.statusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Low stock alert
            </CardTitle>
            <CardDescription>Items running low — restock soon</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.lowStock.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                All stocked up ✓
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {stats.lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.categoryName}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? 'destructive' : 'secondary'} className="ml-2">
                      {p.stock} left
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link href="/admin/products">
                Manage products
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="font-serif text-lg">Recent orders</CardTitle>
            <CardDescription>Latest {recentOrders.length} orders received</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/orders">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING
                  return (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {relativeTime(order.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badge}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {formatPrice(order.totalCents)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-border md:hidden">
            {recentOrders.map((order) => {
              const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.PENDING
              return (
                <li key={order.id} className="p-4">
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="truncate text-sm text-muted-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{relativeTime(order.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold">{formatPrice(order.totalCents)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
                        <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
