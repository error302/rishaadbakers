// Rishaad Bakers — Public Lead submission API
// POST /api/leads — receives an enrolment enquiry from the /school page form.
// Public (no auth). Validates input. Stores in DB so admin can follow up.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Valid email is required').max(200),
  phone: z.string().min(5, 'Phone is required').max(40),
  programInterest: z.string().max(120).optional().default('Beginner Baking Class'),
  preferredStart: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    const lead = await db.lead.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        programInterest: data.programInterest || 'Beginner Baking Class',
        preferredStart: data.preferredStart?.trim() || null,
        message: data.message?.trim() || null,
        status: 'NEW',
        source: 'school_page',
      },
    })

    return NextResponse.json(
      { id: lead.id, success: true, message: 'Enquiry received — we\u2019ll be in touch within one business day.' },
      { status: 201 }
    )
  } catch (e) {
    console.error('Lead submission error:', e)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}
