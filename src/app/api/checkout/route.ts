// Rishaad Bakers — checkout API
// Per Payments & Billing Engineer pattern:
//   - Business-derived idempotency: each order gets a sequential order number
//   - Server re-computes totals (never trust client totals)
//   - Orders are NEVER deleted — only status-transitioned later
//   - Allergies captured per order (Hospitality Guest Services rule)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/format'

type CheckoutPayload = {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  notes?: string
  allergyNotes?: string
  items: Array<{
    productId: string
    name: string
    imageUrl: string
    priceCents: number
    quantity: number
  }>
  subtotalCents: number
  deliveryCents: number
  totalCents: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutPayload

    // Basic validation
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (
      !body.customerName ||
      !body.customerEmail ||
      !body.customerPhone ||
      !body.deliveryAddress ||
      !body.deliveryDate ||
      !body.deliveryTime
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Re-fetch products from DB (never trust client-supplied prices)
    const productIds = body.items.map((i) => i.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isAvailable: true },
    })

    if (products.length !== body.items.length) {
      return NextResponse.json(
        { error: 'One or more items are no longer available' },
        { status: 400 }
      )
    }

    // Re-compute totals server-side
    const productMap = new Map(products.map((p) => [p.id, p]))
    const orderItems = body.items.map((i) => {
      const p = productMap.get(i.productId)!
      const unitPriceCents = p.priceCents
      const subtotalCents = unitPriceCents * i.quantity
      return {
        productId: p.id,
        productName: p.name,
        productImage: p.imageUrl,
        unitPriceCents,
        quantity: i.quantity,
        subtotalCents,
      }
    })

    const serverSubtotal = orderItems.reduce((sum, oi) => sum + oi.subtotalCents, 0)
    // Get delivery fee from settings (don't trust client)
    const deliverySetting = await db.siteSetting.findUnique({
      where: { key: 'store.deliveryFeeCents' },
    })
    const thresholdSetting = await db.siteSetting.findUnique({
      where: { key: 'store.freeDeliveryThresholdCents' },
    })
    const deliveryFee = parseInt(deliverySetting?.value ?? '500', 10)
    const freeThreshold = parseInt(thresholdSetting?.value ?? '7500', 10)
    const serverDelivery = serverSubtotal >= freeThreshold ? 0 : deliveryFee
    const serverTotal = serverSubtotal + serverDelivery

    // Find or create the customer
    let customer = await db.customer.findUnique({
      where: { email: body.customerEmail.toLowerCase() },
    })
    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: body.customerName,
          email: body.customerEmail.toLowerCase(),
          phone: body.customerPhone,
          address: body.deliveryAddress,
        },
      })
    } else {
      // Update latest contact info
      customer = await db.customer.update({
        where: { id: customer.id },
        data: {
          name: body.customerName,
          phone: body.customerPhone,
          address: body.deliveryAddress,
        },
      })
    }

    // Generate a sequential order number
    const orderCount = await db.order.count()
    const orderNumber = generateOrderNumber(orderCount + 1)

    // Parse delivery date as a Date at the requested time
    const deliveryDateTime = new Date(`${body.deliveryDate}T${body.deliveryTime}:00`)

    // Create the order
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: 'PENDING',
        subtotalCents: serverSubtotal,
        deliveryCents: serverDelivery,
        totalCents: serverTotal,
        notes: body.notes?.trim() || null,
        allergyNotes: body.allergyNotes?.trim() || null,
        deliveryDate: isNaN(deliveryDateTime.getTime()) ? null : deliveryDateTime,
        deliveryTime: body.deliveryTime,
        deliveryAddr: body.deliveryAddress,
        orderItems: { create: orderItems },
      },
      include: { orderItems: true },
    })

    // Decrement stock (per WordPress Shopping Cart Engineer rule:
    // "stock reduces on processing" — but for a made-to-order bakery
    // we decrement at order time to prevent over-committing custom cakes)
    await Promise.all(
      orderItems.map((oi) =>
        db.product.update({
          where: { id: oi.productId },
          data: { stock: { decrement: oi.quantity } },
        })
      )
    )

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalCents: order.totalCents,
      status: order.status,
    })
  } catch (e) {
    console.error('Checkout error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
