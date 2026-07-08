// Rishaad Bakers — Stripe integration (conditional)
// When STRIPE_SECRET_KEY is set, real Stripe Checkout is used.
// When blank, the app falls back to "pay on delivery" mode (no online payment).
//
// Per agency-agents Payments & Billing Engineer:
//   - Never touch raw card data — use Stripe Checkout (SAQ A)
//   - Webhooks are source of truth (not the redirect URL)
//   - Verify signatures + dedupe by event ID
//   - Store money as integer cents (already done in our schema)

let stripeInstance: import('stripe').default | null = null
let stripeLoaded = false

export async function getStripe(): Promise<import('stripe').default | null> {
  if (stripeLoaded) return stripeInstance
  stripeLoaded = true

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.log('Stripe: STRIPE_SECRET_KEY not set — pay-on-delivery mode')
    return null
  }

  try {
    // Dynamic import so the stripe package isn't required when keys are absent
    const Stripe = (await import('stripe')).default
    stripeInstance = new Stripe(key, {
      apiVersion: '2024-12-18.acacia' as never,
      typescript: true,
    })
    console.log('Stripe: initialised successfully')
    return stripeInstance
  } catch (e) {
    console.error('Stripe: failed to load — install `stripe` package or remove STRIPE_SECRET_KEY', e)
    return null
  }
}

export function isStripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// Create a Stripe Checkout Session for an order.
// Returns the session URL the client should redirect to.
export async function createCheckoutSession(opts: {
  orderId: string
  orderNumber: string
  totalCents: number
  customerEmail: string
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string } | { error: string }> {
  const stripe = await getStripe()
  if (!stripe) {
    return { error: 'Stripe not configured' }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: opts.customerEmail,
      client_reference_id: opts.orderId,
      line_items: opts.items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: i.unitPriceCents,
          product_data: {
            name: i.name,
          },
        },
      })),
      metadata: {
        orderId: opts.orderId,
        orderNumber: opts.orderNumber,
      },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
    })

    if (!session.url) {
      return { error: 'Stripe did not return a session URL' }
    }
    return { url: session.url }
  } catch (e) {
    console.error('Stripe checkout session error:', e)
    return { error: e instanceof Error ? e.message : 'Stripe checkout failed' }
  }
}

// Verify a Stripe webhook signature.
export async function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ event: import('stripe').Stripe.Event } | { error: string }> {
  const stripe = await getStripe()
  if (!stripe) return { error: 'Stripe not configured' }

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return { error: 'STRIPE_WEBHOOK_SECRET not set' }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret)
    return { event }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Webhook verification failed' }
  }
}
