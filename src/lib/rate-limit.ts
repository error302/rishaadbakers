// Rishaad Bakers — Rate limiter
// In-memory token-bucket rate limiter (no external dependencies).
// Swappable to Upstash Redis for production multi-instance deployments.
//
// Per agency-agents Backend Architect: defense in depth. Rate-limit
// every public-facing mutation endpoint to prevent brute-force and spam.

type Bucket = {
  tokens: number
  lastRefill: number
}

type Rule = {
  // Maximum tokens in the bucket (burst capacity)
  capacity: number
  // Tokens added per second (sustained rate)
  refillPerSecond: number
}

const RULES: Record<string, Rule> = {
  // Login: 5 attempts per 60 seconds per IP
  'auth.login': { capacity: 5, refillPerSecond: 5 / 60 },
  // Lead submission: 3 per 10 minutes per IP
  'leads.submit': { capacity: 3, refillPerSecond: 3 / 600 },
  // Checkout: 5 per 10 minutes per IP
  'checkout.submit': { capacity: 5, refillPerSecond: 5 / 600 },
  // Contact form: 3 per 10 minutes per IP
  'contact.submit': { capacity: 3, refillPerSecond: 3 / 600 },
  // Generic API: 60 per minute per IP
  'api.generic': { capacity: 60, refillPerSecond: 1 },
}

// In-memory store. Resets on server restart (fine for single-instance).
// For multi-instance prod, swap with Upstash Redis (see bottom of file).
const store = new Map<string, Bucket>()

// Periodically purge stale buckets to prevent memory bloat
const PURGE_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
let lastPurge = Date.now()

function purge() {
  const now = Date.now()
  if (now - lastPurge < PURGE_INTERVAL_MS) return
  lastPurge = now
  // Keep only buckets with at least 1 token (recently active)
  for (const [key, bucket] of store.entries()) {
    if (bucket.tokens >= 1) continue
    const age = (now - bucket.lastRefill) / 1000
    if (age > 600) store.delete(key) // remove idle > 10 min
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  resetAt: number // ms timestamp when next token available
}

export function rateLimit(
  rule: keyof typeof RULES | string,
  identifier: string
): RateLimitResult {
  purge()
  const r = RULES[rule]
  if (!r) {
    // Unknown rule — allow (fail open, log)
    console.warn(`Rate limit rule "${rule}" not found — allowing`)
    return { ok: true, remaining: Infinity, resetAt: 0 }
  }

  const key = `${rule}:${identifier}`
  const now = Date.now()
  let bucket = store.get(key)

  if (!bucket) {
    bucket = { tokens: r.capacity, lastRefill: now }
    store.set(key, bucket)
  }

  // Refill tokens based on elapsed time
  const elapsedSeconds = (now - bucket.lastRefill) / 1000
  const refilled = Math.min(r.capacity, bucket.tokens + elapsedSeconds * r.refillPerSecond)
  bucket.tokens = refilled
  bucket.lastRefill = now

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return {
      ok: true,
      remaining: Math.floor(bucket.tokens),
      resetAt: 0,
    }
  }

  // No tokens left — calculate when next one will be available
  const secondsUntilNext = (1 - bucket.tokens) / r.refillPerSecond
  return {
    ok: false,
    remaining: 0,
    resetAt: now + secondsUntilNext * 1000,
  }
}

// Helper for Next.js API routes — extract client IP from request
export function getClientIP(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri
  return 'unknown'
}

// ─── Upstash Redis adapter (optional, for production) ─────────────────
// To enable: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars,
// then swap rateLimit() above to call rateLimitUpstash() instead.
//
// import { Redis } from '@upstash/redis'
// const redis = process.env.UPSTASH_REDIS_REST_URL
//   ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
//   : null
//
// export async function rateLimitUpstash(rule: string, identifier: string): Promise<RateLimitResult> {
//   if (!redis) return rateLimit(rule, identifier) // fallback to in-memory
//   const r = RULES[rule]
//   const key = `ratelimit:${rule}:${identifier}`
//   const count = await redis.incr(key)
//   if (count === 1) await redis.expire(key, Math.ceil(r.capacity / r.refillPerSecond))
//   return { ok: count <= r.capacity, remaining: Math.max(0, r.capacity - count), resetAt: 0 }
// }
