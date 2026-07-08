// Rishaad Bakers — proxy (Next.js 16 renamed middleware → proxy)
// Protects all /admin/* routes except /admin/login.
// Per agency-agents Backend Architect pattern: defense in depth, least privilege.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  if (!token || token.role !== 'ADMIN') {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/((?!login).*)'],
}
