// Rishaad Bakers — site settings helper
// Reads the key/value SiteSetting table into a typed object.

import { db } from '@/lib/db'

export type SiteSettings = {
  storeName: string
  tagline: string
  phone: string
  email: string
  address: string
  hoursWeekday: string
  hoursWeekend: string
  hoursClosed: string
  instagram: string
  deliveryFeeCents: number
  freeDeliveryThresholdCents: number
  about: string
}

const DEFAULTS: SiteSettings = {
  storeName: 'Rishaad Bakers',
  tagline: 'Hand-crafted cakes, baked with love since 2014',
  phone: '+1 (555) 123-4567',
  email: 'hello@rishaadbakers.com',
  address: '142 Honeycrisp Lane, Old Town District, Portland, OR 97204',
  hoursWeekday: 'Tue–Fri: 7:00 AM – 6:00 PM',
  hoursWeekend: 'Sat–Sun: 8:00 AM – 5:00 PM',
  hoursClosed: 'Closed Mondays',
  instagram: 'https://instagram.com/rishaadbakers',
  deliveryFeeCents: 500,
  freeDeliveryThresholdCents: 7500,
  about:
    'Rishaad Bakers began in a tiny home kitchen with one simple goal: to bake cakes that taste as good as they look.',
}

const KEY_MAP: Record<keyof SiteSettings, string> = {
  storeName: 'store.name',
  tagline: 'store.tagline',
  phone: 'store.phone',
  email: 'store.email',
  address: 'store.address',
  hoursWeekday: 'store.hours.weekday',
  hoursWeekend: 'store.hours.weekend',
  hoursClosed: 'store.hours.closed',
  instagram: 'store.instagram',
  deliveryFeeCents: 'store.deliveryFeeCents',
  freeDeliveryThresholdCents: 'store.freeDeliveryThresholdCents',
  about: 'store.about',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value

    return {
      storeName: map[KEY_MAP.storeName] ?? DEFAULTS.storeName,
      tagline: map[KEY_MAP.tagline] ?? DEFAULTS.tagline,
      phone: map[KEY_MAP.phone] ?? DEFAULTS.phone,
      email: map[KEY_MAP.email] ?? DEFAULTS.email,
      address: map[KEY_MAP.address] ?? DEFAULTS.address,
      hoursWeekday: map[KEY_MAP.hoursWeekday] ?? DEFAULTS.hoursWeekday,
      hoursWeekend: map[KEY_MAP.hoursWeekend] ?? DEFAULTS.hoursWeekend,
      hoursClosed: map[KEY_MAP.hoursClosed] ?? DEFAULTS.hoursClosed,
      instagram: map[KEY_MAP.instagram] ?? DEFAULTS.instagram,
      deliveryFeeCents: parseInt(map[KEY_MAP.deliveryFeeCents] ?? '', 10) || DEFAULTS.deliveryFeeCents,
      freeDeliveryThresholdCents:
        parseInt(map[KEY_MAP.freeDeliveryThresholdCents] ?? '', 10) || DEFAULTS.freeDeliveryThresholdCents,
      about: map[KEY_MAP.about] ?? DEFAULTS.about,
    }
  } catch {
    return DEFAULTS
  }
}

// For the admin settings page — list all keys for editing.
export const SETTING_KEYS = KEY_MAP
