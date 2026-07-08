// Rishaad Bakers — notifications & error logging
// Per agency-agents Backend Architect: structured logs with request IDs,
// never swallow errors silently. Swappable backends (console → email/Sentry).

import type { Lead, Order } from '@prisma/client'

// ─── Email notifications (Resend) ──────────────────────────────────────
// When RESEND_API_KEY is set, sends real email. Otherwise logs to console.

type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Rishaad Baker\'s <noreply@rishaadbakers.com>'

  if (!apiKey) {
    // Dev mode: log to console
    console.log('📧 [EMAIL — dev mode]', {
      from,
      to: payload.to,
      subject: payload.subject,
      preview: payload.text?.slice(0, 200) ?? payload.html.slice(0, 200),
    })
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Email send failed:', err)
      return false
    }
    return true
  } catch (e) {
    console.error('Email send error:', e)
    return false
  }
}

// ─── Notification helpers ──────────────────────────────────────────────

export async function notifyNewLead(lead: Lead): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rishaadbakers.com'
  await sendEmail({
    to: adminEmail,
    subject: `🎓 New enrolment enquiry: ${lead.name}`,
    html: `
      <h2>New enrolment enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
      <p><strong>Program:</strong> ${escapeHtml(lead.programInterest)}</p>
      ${lead.preferredStart ? `<p><strong>Preferred start:</strong> ${escapeHtml(lead.preferredStart)}</p>` : ''}
      ${lead.message ? `<p><strong>Message:</strong><br>${escapeHtml(lead.message)}</p>` : ''}
      <hr>
      <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/leads">View in admin dashboard →</a></p>
    `,
    text: `New enrolment enquiry from ${lead.name} (${lead.email}, ${lead.phone}) for ${lead.programInterest}. View at /admin/leads`,
  })
}

export async function notifyNewOrder(order: Order & { customer: { name: string; email: string } }): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rishaadbakers.com'
  const totalFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalCents / 100)
  await sendEmail({
    to: adminEmail,
    subject: `🛒 New order ${order.orderNumber}`,
    html: `
      <h2>New order received</h2>
      <p><strong>Order:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${escapeHtml(order.customer.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.customer.email)}</p>
      <p><strong>Total:</strong> ${totalFormatted}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      ${order.allergyNotes ? `<p style="background:#fef3c7;padding:8px;"><strong>⚠️ Allergy notes:</strong> ${escapeHtml(order.allergyNotes)}</p>` : ''}
      <hr>
      <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/orders/${order.id}">View order →</a></p>
    `,
    text: `New order ${order.orderNumber} from ${order.customer.name} — ${totalFormatted}. View at /admin/orders/${order.id}`,
  })
}

export async function notifyOrderConfirmation(order: Order & { customer: { name: string; email: string } }): Promise<void> {
  const totalFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.totalCents / 100)
  await sendEmail({
    to: order.customer.email,
    subject: `Order ${order.orderNumber} confirmed — Rishaad Baker's`,
    html: `
      <h2>Thank you for your order, ${escapeHtml(order.customer.name.split(' ')[0])}!</h2>
      <p>We've received your order <strong>${order.orderNumber}</strong> and our bakers are getting ready to start.</p>
      <p><strong>Total:</strong> ${totalFormatted}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <hr>
      <p>You can view your full order details here:</p>
      <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/order-confirmation?id=${order.id}">View order →</a></p>
      <hr>
      <p>Questions? Reply to this email or WhatsApp us.</p>
      <p>— The Rishaad Baker's team</p>
    `,
    text: `Hi ${order.customer.name}, your order ${order.orderNumber} (${totalFormatted}) has been received. View at /order-confirmation?id=${order.id}`,
  })
}

// ─── Error logging (Sentry-ready) ──────────────────────────────────────

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const sentryDsn = process.env.SENTRY_DSN
  const err = error instanceof Error ? error : new Error(String(error))

  // Always log to console with context
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    context,
    timestamp: new Date().toISOString(),
  })

  // In production with Sentry configured, send to Sentry
  // (would require @sentry/nextjs setup — left as a stub)
  if (sentryDsn) {
    // Sentry.captureException(err, { extra: context })
    // For now, just note that Sentry is configured
    console.log('[SENTRY] Error would be reported (install @sentry/nextjs to enable)')
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
