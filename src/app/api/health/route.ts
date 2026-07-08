// Rishaad Bakers — health check endpoint
// GET /api/health — returns 200 if app + DB are healthy.
// Used by uptime monitors (Pingdom, UptimeRobot, Vercel cron).

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const started = Date.now()
  try {
    // Simple DB ping
    await db.siteSetting.count({ take: 1 })
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - started,
      checks: {
        database: 'ok',
      },
    })
  } catch (e) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - started,
        checks: {
          database: 'fail',
          error: e instanceof Error ? e.message : 'Unknown DB error',
        },
      },
      { status: 503 }
    )
  }
}
