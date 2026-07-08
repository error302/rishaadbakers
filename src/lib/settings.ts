// Rishaad Bakers — site settings helper
// Reads the key/value SiteSetting table into a typed object.
//
// All editable site content lives here so the admin "Content" page can mutate
// every word the customer sees without touching code.

import { db } from '@/lib/db'

export type SiteSettings = {
  // Brand
  storeName: string
  tagline: string
  logoUrl: string
  logoAlt: string

  // Hero (homepage)
  heroHeadline: string
  heroHeadlineAccent: string
  heroSubtext: string
  heroCtaPrimary: string
  heroCtaSecondary: string
  heroBadge: string

  // About
  aboutTitle: string
  about: string
  aboutCtaText: string

  // Footer
  footerTagline: string
  footerCopyright: string

  // Contact
  phone: string
  email: string
  address: string
  hoursWeekday: string
  hoursWeekend: string
  hoursClosed: string
  instagram: string
  whatsapp: string

  // School / Baking Class
  schoolEnabled: boolean
  schoolHeadline: string
  schoolSubheadline: string
  schoolBadge: string
  schoolIntro: string
  schoolProgramName: string
  schoolPrice: string
  schoolDuration: string
  schoolItemsLearned: string // newline-separated
  schoolFeatures: string // newline-separated
  schoolCtaText: string
  schoolUrgency: string
  schoolNote: string
  schoolContact: string
  schoolContactPhone: string

  // Delivery (cart logic)
  deliveryFeeCents: number
  freeDeliveryThresholdCents: number
}

const DEFAULTS: SiteSettings = {
  storeName: "Rishaad Baker's",
  tagline: 'Delicious Taste — Hand-crafted cakes, baked with love',
  logoUrl: '/rishaad-logo.jpeg',
  logoAlt: "Rishaad Baker's logo — Delicious Taste",

  heroHeadline: 'Cakes worth',
  heroHeadlineAccent: 'celebrating',
  heroSubtext:
    "Hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes. Every layer is whisked by hand, every flower piped with care, and every bite made with the kind of ingredients we'd feed our own families.",
  heroCtaPrimary: 'Browse the Menu',
  heroCtaSecondary: 'Our Story',
  heroBadge: 'Baked fresh every morning',

  aboutTitle: 'From a home kitchen to a neighbourhood institution.',
  about:
    "Rishaad Baker's began in a tiny home kitchen with one simple goal: to bake cakes that taste as good as they look. A decade later, we still whisk every batter by hand, source our chocolate from a single Belgian estate, and refuse to use anything we wouldn't feed our own families. Every cake that leaves our shop carries our name — and our promise.",
  aboutCtaText: 'Read more about us',

  footerTagline: 'Delicious Taste — Hand-crafted cakes, baked with love',
  footerCopyright: "Rishaad Baker's. All rights reserved.",

  phone: '0724 266 695',
  email: 'hello@rishaadbakers.com',
  address: 'Nairobi, Kenya',
  hoursWeekday: 'Tue–Fri: 8:00 AM – 6:00 PM',
  hoursWeekend: 'Sat–Sun: 9:00 AM – 5:00 PM',
  hoursClosed: 'Closed Mondays',
  instagram: 'https://instagram.com/rishaadbakers',
  whatsapp: '254724266695',

  schoolEnabled: true,
  schoolHeadline: 'BEGINNER BAKING CLASS',
  schoolSubheadline: 'LEARN. BAKE. EARN!',
  schoolBadge: 'Now enrolling',
  schoolIntro:
    "Turn your passion for baking into profit. Join our hands-on beginner baking class and learn to make 11 different cakes, cookies, icings, and a honeycomb — all in six weeks, with recipes and step-by-step guidance included.",
  schoolProgramName: 'Beginner Baking Class',
  schoolPrice: '15,000',
  schoolDuration: '6 Weeks',
  schoolItemsLearned: [
    'Vanilla Cake',
    'Chocolate Cake',
    'Passion Cake',
    'Lemon Cake',
    'Strawberry Cake',
    'Classic Red Velvet',
    'Classic Black Forest',
    'Cookies',
    'Cup Cakes',
    'Soft Icing & Hard Icing',
    'Honey Comb',
    'Final Cake Exam',
  ].join('\n'),
  schoolFeatures: [
    'Hands-On Practicals',
    'Beginner Friendly',
    'Step-By-Step Guidance',
    'Small Class Size',
    'Recipes & Tips Included',
  ].join('\n'),
  schoolCtaText: 'TURN YOUR PASSION INTO PROFIT!',
  schoolUrgency: 'LIMITED SLOTS! BOOK YOUR SPOT NOW!',
  schoolNote:
    'NOTE: All students carry their baked products home. Students are to buy their own tools.',
  schoolContact: 'For More Info',
  schoolContactPhone: '0724 266 695',

  deliveryFeeCents: 500,
  freeDeliveryThresholdCents: 7500,
}

const KEY_MAP: Record<keyof SiteSettings, string> = {
  storeName: 'store.name',
  tagline: 'store.tagline',
  logoUrl: 'store.logoUrl',
  logoAlt: 'store.logoAlt',

  heroHeadline: 'hero.headline',
  heroHeadlineAccent: 'hero.headlineAccent',
  heroSubtext: 'hero.subtext',
  heroCtaPrimary: 'hero.ctaPrimary',
  heroCtaSecondary: 'hero.ctaSecondary',
  heroBadge: 'hero.badge',

  aboutTitle: 'about.title',
  about: 'about.body',
  aboutCtaText: 'about.ctaText',

  footerTagline: 'footer.tagline',
  footerCopyright: 'footer.copyright',

  phone: 'store.phone',
  email: 'store.email',
  address: 'store.address',
  hoursWeekday: 'store.hours.weekday',
  hoursWeekend: 'store.hours.weekend',
  hoursClosed: 'store.hours.closed',
  instagram: 'store.instagram',
  whatsapp: 'store.whatsapp',

  schoolEnabled: 'school.enabled',
  schoolHeadline: 'school.headline',
  schoolSubheadline: 'school.subheadline',
  schoolBadge: 'school.badge',
  schoolIntro: 'school.intro',
  schoolProgramName: 'school.programName',
  schoolPrice: 'school.price',
  schoolDuration: 'school.duration',
  schoolItemsLearned: 'school.itemsLearned',
  schoolFeatures: 'school.features',
  schoolCtaText: 'school.ctaText',
  schoolUrgency: 'school.urgency',
  schoolNote: 'school.note',
  schoolContact: 'school.contact',
  schoolContactPhone: 'school.contactPhone',

  deliveryFeeCents: 'store.deliveryFeeCents',
  freeDeliveryThresholdCents: 'store.freeDeliveryThresholdCents',
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value

    const parseBool = (v: string | undefined, fallback: boolean) =>
      v === undefined ? fallback : v === 'true' || v === '1'

    return {
      storeName: map[KEY_MAP.storeName] ?? DEFAULTS.storeName,
      tagline: map[KEY_MAP.tagline] ?? DEFAULTS.tagline,
      logoUrl: map[KEY_MAP.logoUrl] ?? DEFAULTS.logoUrl,
      logoAlt: map[KEY_MAP.logoAlt] ?? DEFAULTS.logoAlt,

      heroHeadline: map[KEY_MAP.heroHeadline] ?? DEFAULTS.heroHeadline,
      heroHeadlineAccent: map[KEY_MAP.heroHeadlineAccent] ?? DEFAULTS.heroHeadlineAccent,
      heroSubtext: map[KEY_MAP.heroSubtext] ?? DEFAULTS.heroSubtext,
      heroCtaPrimary: map[KEY_MAP.heroCtaPrimary] ?? DEFAULTS.heroCtaPrimary,
      heroCtaSecondary: map[KEY_MAP.heroCtaSecondary] ?? DEFAULTS.heroCtaSecondary,
      heroBadge: map[KEY_MAP.heroBadge] ?? DEFAULTS.heroBadge,

      aboutTitle: map[KEY_MAP.aboutTitle] ?? DEFAULTS.aboutTitle,
      about: map[KEY_MAP.about] ?? DEFAULTS.about,
      aboutCtaText: map[KEY_MAP.aboutCtaText] ?? DEFAULTS.aboutCtaText,

      footerTagline: map[KEY_MAP.footerTagline] ?? DEFAULTS.footerTagline,
      footerCopyright: map[KEY_MAP.footerCopyright] ?? DEFAULTS.footerCopyright,

      phone: map[KEY_MAP.phone] ?? DEFAULTS.phone,
      email: map[KEY_MAP.email] ?? DEFAULTS.email,
      address: map[KEY_MAP.address] ?? DEFAULTS.address,
      hoursWeekday: map[KEY_MAP.hoursWeekday] ?? DEFAULTS.hoursWeekday,
      hoursWeekend: map[KEY_MAP.hoursWeekend] ?? DEFAULTS.hoursWeekend,
      hoursClosed: map[KEY_MAP.hoursClosed] ?? DEFAULTS.hoursClosed,
      instagram: map[KEY_MAP.instagram] ?? DEFAULTS.instagram,
      whatsapp: map[KEY_MAP.whatsapp] ?? DEFAULTS.whatsapp,

      schoolEnabled: parseBool(map[KEY_MAP.schoolEnabled], DEFAULTS.schoolEnabled),
      schoolHeadline: map[KEY_MAP.schoolHeadline] ?? DEFAULTS.schoolHeadline,
      schoolSubheadline: map[KEY_MAP.schoolSubheadline] ?? DEFAULTS.schoolSubheadline,
      schoolBadge: map[KEY_MAP.schoolBadge] ?? DEFAULTS.schoolBadge,
      schoolIntro: map[KEY_MAP.schoolIntro] ?? DEFAULTS.schoolIntro,
      schoolProgramName: map[KEY_MAP.schoolProgramName] ?? DEFAULTS.schoolProgramName,
      schoolPrice: map[KEY_MAP.schoolPrice] ?? DEFAULTS.schoolPrice,
      schoolDuration: map[KEY_MAP.schoolDuration] ?? DEFAULTS.schoolDuration,
      schoolItemsLearned: map[KEY_MAP.schoolItemsLearned] ?? DEFAULTS.schoolItemsLearned,
      schoolFeatures: map[KEY_MAP.schoolFeatures] ?? DEFAULTS.schoolFeatures,
      schoolCtaText: map[KEY_MAP.schoolCtaText] ?? DEFAULTS.schoolCtaText,
      schoolUrgency: map[KEY_MAP.schoolUrgency] ?? DEFAULTS.schoolUrgency,
      schoolNote: map[KEY_MAP.schoolNote] ?? DEFAULTS.schoolNote,
      schoolContact: map[KEY_MAP.schoolContact] ?? DEFAULTS.schoolContact,
      schoolContactPhone: map[KEY_MAP.schoolContactPhone] ?? DEFAULTS.schoolContactPhone,

      deliveryFeeCents: parseInt(map[KEY_MAP.deliveryFeeCents] ?? '', 10) || DEFAULTS.deliveryFeeCents,
      freeDeliveryThresholdCents:
        parseInt(map[KEY_MAP.freeDeliveryThresholdCents] ?? '', 10) || DEFAULTS.freeDeliveryThresholdCents,
    }
  } catch {
    return DEFAULTS
  }
}

// For the admin settings/content pages — list all keys for editing.
export const SETTING_KEYS = KEY_MAP

// Group keys by category for the admin Content editor.
export const SETTING_GROUPS: { label: string; keys: (keyof SiteSettings)[] }[] = [
  {
    label: 'Brand & Logo',
    keys: ['storeName', 'tagline', 'logoUrl', 'logoAlt'],
  },
  {
    label: 'Homepage Hero',
    keys: ['heroBadge', 'heroHeadline', 'heroHeadlineAccent', 'heroSubtext', 'heroCtaPrimary', 'heroCtaSecondary'],
  },
  {
    label: 'About Section',
    keys: ['aboutTitle', 'about', 'aboutCtaText'],
  },
  {
    label: 'School / Baking Class',
    keys: [
      'schoolEnabled',
      'schoolBadge',
      'schoolHeadline',
      'schoolSubheadline',
      'schoolIntro',
      'schoolProgramName',
      'schoolPrice',
      'schoolDuration',
      'schoolItemsLearned',
      'schoolFeatures',
      'schoolCtaText',
      'schoolUrgency',
      'schoolNote',
      'schoolContact',
      'schoolContactPhone',
    ],
  },
  {
    label: 'Contact & Hours',
    keys: ['phone', 'whatsapp', 'email', 'address', 'hoursWeekday', 'hoursWeekend', 'hoursClosed', 'instagram'],
  },
  {
    label: 'Footer',
    keys: ['footerTagline', 'footerCopyright'],
  },
  {
    label: 'Delivery',
    keys: ['deliveryFeeCents', 'freeDeliveryThresholdCents'],
  },
]

// Field metadata for rendering the admin editor
export type FieldMeta = {
  key: keyof SiteSettings
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'currency' | 'multiline-list'
  label: string
  help?: string
  placeholder?: string
}

export const FIELD_META: FieldMeta[] = [
  // Brand & Logo
  { key: 'storeName', type: 'text', label: 'Store name', help: 'Shown in header, footer, browser title.' },
  { key: 'tagline', type: 'text', label: 'Tagline', help: 'Short descriptor under the brand.' },
  { key: 'logoUrl', type: 'text', label: 'Logo URL', help: 'Paste an image URL or use /rishaad-logo.jpeg. Tip: upload to /public/uploads/ for local files.', placeholder: '/rishaad-logo.jpeg' },
  { key: 'logoAlt', type: 'text', label: 'Logo alt text', help: 'Screen-reader text for the logo.' },

  // Hero
  { key: 'heroBadge', type: 'text', label: 'Hero badge', help: 'Small badge above the headline (e.g. "Baked fresh every morning").' },
  { key: 'heroHeadline', type: 'text', label: 'Hero headline (line 1)' },
  { key: 'heroHeadlineAccent', type: 'text', label: 'Hero headline (accent line)', help: 'Displayed in accent colour on its own line.' },
  { key: 'heroSubtext', type: 'textarea', label: 'Hero subtext' },
  { key: 'heroCtaPrimary', type: 'text', label: 'Primary CTA button text' },
  { key: 'heroCtaSecondary', type: 'text', label: 'Secondary CTA button text' },

  // About
  { key: 'aboutTitle', type: 'text', label: 'About title' },
  { key: 'about', type: 'textarea', label: 'About body' },
  { key: 'aboutCtaText', type: 'text', label: 'About CTA button text' },

  // School
  { key: 'schoolEnabled', type: 'boolean', label: 'Show school section on homepage', help: 'Toggle visibility of the Baking Class section + nav link.' },
  { key: 'schoolBadge', type: 'text', label: 'School badge text', help: 'Small label above the headline (e.g. "Now enrolling").' },
  { key: 'schoolHeadline', type: 'text', label: 'School headline' },
  { key: 'schoolSubheadline', type: 'text', label: 'School subheadline' },
  { key: 'schoolIntro', type: 'textarea', label: 'School intro paragraph' },
  { key: 'schoolProgramName', type: 'text', label: 'Program name' },
  { key: 'schoolPrice', type: 'text', label: 'Price', help: 'Free-form text (e.g. "15,000" or "KES 15,000").' },
  { key: 'schoolDuration', type: 'text', label: 'Duration', help: 'Free-form text (e.g. "6 Weeks").' },
  { key: 'schoolItemsLearned', type: 'multiline-list', label: 'Items students will learn', help: 'One item per line. Each becomes a list item on the school page.' },
  { key: 'schoolFeatures', type: 'multiline-list', label: 'Class features', help: 'One feature per line.' },
  { key: 'schoolCtaText', type: 'text', label: 'Call-to-action headline' },
  { key: 'schoolUrgency', type: 'text', label: 'Urgency line' },
  { key: 'schoolNote', type: 'textarea', label: 'Note to students' },
  { key: 'schoolContact', type: 'text', label: 'Contact label (e.g. "For More Info")' },
  { key: 'schoolContactPhone', type: 'text', label: 'Contact phone', help: 'Used for WhatsApp link + call link.' },

  // Contact
  { key: 'phone', type: 'text', label: 'Phone' },
  { key: 'whatsapp', type: 'text', label: 'WhatsApp number', help: 'International format, digits only (e.g. 254724266695).' },
  { key: 'email', type: 'text', label: 'Email' },
  { key: 'address', type: 'textarea', label: 'Address' },
  { key: 'hoursWeekday', type: 'text', label: 'Weekday hours' },
  { key: 'hoursWeekend', type: 'text', label: 'Weekend hours' },
  { key: 'hoursClosed', type: 'text', label: 'Closed days' },
  { key: 'instagram', type: 'text', label: 'Instagram URL' },

  // Footer
  { key: 'footerTagline', type: 'textarea', label: 'Footer tagline' },
  { key: 'footerCopyright', type: 'text', label: 'Footer copyright text' },

  // Delivery
  { key: 'deliveryFeeCents', type: 'currency', label: 'Delivery fee (USD)', help: 'Charged per order below the free-delivery threshold.' },
  { key: 'freeDeliveryThresholdCents', type: 'currency', label: 'Free delivery threshold (USD)' },
]
