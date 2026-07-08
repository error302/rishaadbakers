// Rishaad Bakers — Stripe webhook handler
// POST /api/stripe/webhook
// Receives Stripe events. Verifies signature. Updates order status.
//
// Per agency-agents Payments & Billing Engineer:
//   - Webhooks are the source of truth (NOT the redirect URL)
//   - Verify raw body signature
//   - Dedupe by event ID (Stripe may retry)
//   - Re-fetch state — don't trust event order
//   - Idempotent: processing the same event twice = no-op

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyStripeWebhook } from '@/lib/stripe'
import { logError } from '@/lib/notifications'

// Track processed event IDs (in-memory; for prod use Redis or a DB table)
const processedEvents = new Set<string>()

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Get raw body as text (Stripe needs the exact bytes)
  const payload = await req.text()

  const verified = await verifyStripeWebhook(payload, signature)
  if ('error' in verified) {
    console.error('Webhook signature verification failed:', verified.error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = verified.event

  // Dedupe by event ID (Stripe retries; we must be idempotent)
  if (processedEvents.has(event.id)) {
    console.log(`Webhook event ${event.id} already processed — skipping`)
    return NextResponse.json({ received: true, deduped: true })
  }
  processedEvents.add(event.id)
  // Cap the set size to prevent unbounded memory growth
  if (processedEvents.size > 1000) {
    const first = processedEvents.values().next().value
    if (first) processedEvents.delete(first)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { client_reference_id?: string; payment_status?: string }
        const orderId = session.client_reference_id
        if (!orderId) break

        // Re-fetch the order (don't trust event order)
        const order = await db.order.findUnique({ where: { id: orderId } })
        if (!order) {
          console.warn(`Webhook: order ${orderId} not found`)
          break
        }

        // Only transition if currently PENDING
        if (order.status === 'PENDING') {
          await db.order.update({
            where: { id: orderId },
            data: { status: 'PROCESSING' },
          })
          console.log(`Webhook: order ${order.orderNumber} → PROCESSING (paid)`)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as { metadata?: { orderId?: string } }
        const orderId = charge.metadata?.orderId
        if (!orderId) break

        const order = await db.order.findUnique({ where: { id: orderId } })
        if (!order) break

        if (order.status !== 'REFUNDED') {
          await db.order.update({
            where: { id: orderId },
            data: { status: 'REFUNDED' },
          })
          // Restore stock
          const items = await db.orderItem.findMany({ where: { orderId } })
          await Promise.all(
            items.map((oi) =>
              db.product.update({
                where: { id: oi.productId },
                data: { stock: { increment: oi.quantity } },
              })
            )
          )
          console.log(`Webhook: order ${order.orderNumber} → REFUNDED`)
        }
        break
      }

      default:
        // Unhandled event — log and acknowledge
        console.log(`Webhook: unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    logError(e, { endpoint: 'stripe.webhook', eventType: event.type, eventId: event.id })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
