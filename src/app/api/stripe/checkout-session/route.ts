// Rishaad Bakers — Stripe Checkout session creation
// POST /api/stripe/checkout-session
// Called from the checkout page when Stripe is enabled.
// Returns a Stripe Checkout URL the client redirects to.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getStripe, isStripeEnabled, createCheckoutSession } from '@/lib/stripe'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { logError } from '@/lib/notifications'

type Body = {
  orderId: string
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = getClientIP(req)
  const limit = rateLimit('checkout.submit', ip)
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: 'Online payments not configured. Use pay-on-delivery.' },
      { status: 503 }
    )
  }

  try {
    const { orderId } = (await req.json()) as Body
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Fetch order with items + customer
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, customer: true },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Order already ${order.status.toLowerCase()} — cannot start payment` },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const result = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      customerEmail: order.customer.email,
      items: order.orderItems.map((oi) => ({
        name: oi.productName,
        quantity: oi.quantity,
        unitPriceCents: oi.unitPriceCents,
      })),
      successUrl: `${baseUrl}/order-confirmation?id=${order.id}&stripe=success`,
      cancelUrl: `${baseUrl}/cart?stripe=cancelled`,
    })

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ url: result.url })
  } catch (e) {
    logError(e, { endpoint: 'stripe.checkout-session' })
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
