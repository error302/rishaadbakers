// Rishaad Bakers — Admin Orders status API
// PATCH /api/admin/orders/[id]/status — transition order status
// Per Payments Engineer: state-machine enforced, server-side.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'
import { canTransition } from '@/lib/format'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const order = await db.order.findUnique({ where: { id } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (!canTransition(order.status, status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${order.status} to ${status}` },
      { status: 400 }
    )
  }

  // If transitioning to CANCELLED or REFUNDED, restore stock
  if (status === 'CANCELLED' || status === 'REFUNDED') {
    const items = await db.orderItem.findMany({ where: { orderId: id } })
    await Promise.all(
      items.map((oi) =>
        db.product.update({
          where: { id: oi.productId },
          data: { stock: { increment: oi.quantity } },
        })
      )
    )
  }

  const updated = await db.order.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ id: updated.id, status: updated.status })
}
