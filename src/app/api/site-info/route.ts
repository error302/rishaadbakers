// Rishaad Bakers — public site info endpoint
// Returns brand name, logo URL, logo alt for the admin login page (no auth needed).

import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'

export async function GET() {
  const settings = await getSiteSettings()
  return NextResponse.json({
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    logoAlt: settings.logoAlt,
    schoolEnabled: settings.schoolEnabled,
  })
}
