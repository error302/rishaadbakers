# Rishaad Bakers

A mobile-friendly and desktop-friendly bakery website with a robust admin dashboard. Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma, and NextAuth.

## ✨ Features

### Storefront
- **Home page** with hero, featured cakes, categories, about teaser, testimonials, and CTA
- **Menu** with category filter, search, and responsive grid
- **Product detail** with image gallery, dietary tags, ingredients, related products, and quantity selector
- **About** page with bakery story, values, and team
- **Contact** page with form (subject picker, allergy capture)
- **Cart** — slide-out cart sheet + dedicated cart page with quantity controls
- **Checkout** — customer info, delivery date/time, address, allergy notes, order notes
- **Order confirmation** page with full order summary and next-steps

### Admin Dashboard (protected)
- **Dashboard** with revenue, orders, products, customers KPIs; 7-day revenue chart; order-status pie chart; low-stock alerts; recent orders table
- **Products** management — searchable/filterable list, create/edit with 3-tab form (Details, Pricing & Inventory, Media & Tags), soft-delete
- **Orders** management — searchable/filterable list, order detail with state-machine status transitions (PENDING → PROCESSING → COMPLETED/CANCELLED → REFUNDED), allergy alerts
- **Categories** management — card grid with create/edit dialog, delete with product check
- **Customers** list with detail dialog showing order history and stats
- **Settings** page — store info, contact, hours, delivery fees

### Cross-cutting
- **Light / Dark / System theme toggle** (per agency-agents UX Architect pattern)
- **Mobile-first responsive** — hamburger menu, mobile cards, touch-friendly targets
- **WCAG 2.1 AA** — semantic HTML, ARIA labels, keyboard nav, alt text
- **Soft deletes** for products (orders are never deleted, only status-transitioned)
- **Money as integer cents** (no floating-point errors)
- **Allergy capture** on every order (per Hospitality Guest Services rule)
- **Server-side price re-computation** at checkout (never trust client totals)

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Database**: Prisma ORM + SQLite
- **Auth**: NextAuth.js v4 (credentials provider, JWT sessions)
- **State**: Zustand (cart) + React Hook Form + Zod (forms)
- **Charts**: Recharts
- **Icons**: Lucide
- **Notifications**: Sonner

## 🎨 Design System

Warm artisanal bakery palette:
- **Primary**: caramel brown (`oklch(0.45 0.08 50)`)
- **Accent**: rose-pink (`oklch(0.72 0.13 25)`)
- **Background**: warm cream (`oklch(0.985 0.012 80)`)
- **Fonts**: Geist Sans (body) + Playfair Display (serif headings)

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- SQLite (file-based, included)

### Installation

```bash
# Install dependencies
bun install   # or npm install

# Set up the database
bun run db:push

# Seed the database with sample data
bun run scripts/seed.ts

# Start the dev server
bun run dev
```

Visit http://localhost:3000 for the storefront.

### Admin Access

Visit http://localhost:3000/admin/login and sign in with:

- **Email**: `admin@rishaadbakers.com`
- **Password**: `admin123`

## 📁 Project Structure

```
src/
├── app/
│   ├── (storefront pages)        # page.tsx, menu/, product/[slug]/, about/, contact/, cart/, checkout/, order-confirmation/
│   ├── admin/                    # login/, layout.tsx, page.tsx (dashboard), products/, orders/, categories/, customers/, settings/
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth route
│       ├── checkout/             # POST — create order
│       └── admin/                # products, orders, categories, settings CRUD
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── storefront/               # header, footer, product-card, cart-sheet, theme-toggle, storefront-shell
│   ├── admin/                    # admin-sidebar, admin-header, product-form
│   └── providers/                # ThemeProvider + SessionProvider
├── lib/
│   ├── auth.ts                   # NextAuth config + hashPassword + requireAdmin
│   ├── db.ts                     # Prisma client singleton
│   ├── format.ts                 # formatPrice, formatDate, ORDER_STATUS_META, state machine
│   ├── queries.ts                # data-access layer (products, orders, customers, dashboard stats)
│   ├── settings.ts               # SiteSettings typed wrapper
│   ├── types.ts                  # serializable app types
│   └── validations.ts            # zod schemas
├── store/
│   └── cart.ts                   # Zustand cart with localStorage persistence
├── prisma/
│   └── schema.prisma             # User, Category, Product, Customer, Order, OrderItem, SiteSetting
└── middleware.ts                 # NextAuth route protection for /admin/*
```

## 🧱 Database Schema

Following agency-agents Backend Architect patterns:

| Model | Notes |
|---|---|
| `User` | Admin accounts only. cuid IDs, soft-delete (`deletedAt`). Roles: CUSTOMER, ADMIN, BAKER. |
| `Category` | Slug-indexed, sortOrder for custom ordering. |
| `Product` | Soft-delete. Money as `priceCents Int`. Stock with non-negative check. Dietary tags + gallery as JSON-encoded strings (SQLite adapter). |
| `Customer` | Auto-created at checkout from order info. |
| `Order` | Sequential `orderNumber` (RB-1001+). Status state machine. Allergy notes per order. |
| `OrderItem` | Snapshot of product name + image at order time (products may be deleted later). |
| `SiteSetting` | Key/value store for store info, hours, delivery fees. |

## 🔄 Order Status State Machine

```
PENDING  ──→  PROCESSING  ──→  COMPLETED  ──→  REFUNDED
   │              │
   └──────────────┴──→  CANCELLED  (terminal)
```

Stock is decremented at order time and restored on CANCELLED/REFUNDED transitions.

## 🧭 Agency-Agents Patterns Applied

This project applies patterns from the [agency-agents](https://github.com/msitarzewski/agency-agents) prompt library:

| Agent | Pattern Applied |
|---|---|
| **Rapid Prototyper** | Next.js + Prisma + shadcn/ui + react-hook-form + zod + zustand + framer-motion stack |
| **Backend Architect** | cuid IDs, `@@map` plural snake_case, money as integer cents, soft deletes, order state machine |
| **Filament Optimization Specialist** | Admin product form uses 3 tabs instead of flat >8 fields; nav grouped ≤7 items |
| **Payments & Billing Engineer** | Sequential order numbers, server-side price re-computation, orders never deleted |
| **Frontend Developer** | WCAG 2.1 AA, mobile-first, semantic HTML, keyboard navigation |
| **UX Architect** | Light/Dark/System theme toggle, responsive breakpoints (640/768/1024/1280) |
| **Hospitality Guest Services** | Allergy capture on every order (non-negotiable) |
| **Database Optimizer** | Indexes on every FK, JSON-encoded arrays for SQLite compatibility |

## 🔒 Security & Production Hardening

This project ships with production-grade security by default:

- **bcrypt password hashing** (12 rounds) — never SHA-256 or plaintext
- **Strong `NEXTAUTH_SECRET`** required (generate with `openssl rand -base64 32`)
- **Rate limiting** on all public mutation endpoints:
  - Login: 5 attempts / 60s per IP
  - Lead submission: 3 / 10 min per IP
  - Checkout: 5 / 10 min per IP
- **Security headers** (CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **Admin password change page** with strength meter + 12-char minimum + uppercase/lowercase/number requirements
- **Server-side price re-computation** at checkout (never trusts client totals)
- **Soft deletes** for products (orders + leads are never lost)
- **Order state machine** prevents invalid transitions (e.g. COMPLETED → PENDING)
- **Stripe webhook signature verification** + event-ID deduplication

## 🚀 Going to Production

### 1. Database: SQLite → Postgres (REQUIRED for production)

SQLite is fine for dev and ~100 concurrent users. For production:

```bash
# 1. Create a free Postgres DB (Supabase, Neon, Railway, or Vercel Postgres)
# 2. Update prisma/schema.prisma:
#    datasource db {
#      provider = "postgresql"   # was "sqlite"
#      url      = env("DATABASE_URL")
#    }
# 3. Set DATABASE_URL in your production env
# 4. Push the schema + seed:
bun run db:push
ADMIN_PASSWORD="your-strong-password" bun run scripts/seed.ts
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in production values:

| Variable | Required? | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string |
| `NEXTAUTH_SECRET` | ✅ | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your deployed URL (e.g. `https://rishaadbakers.com`) |
| `ADMIN_PASSWORD` | ✅ | Strong admin password (used by seed) |
| `STRIPE_SECRET_KEY` | 💳 Optional | Enable online payments |
| `STRIPE_PUBLISHABLE_KEY` | 💳 Optional | Enable online payments |
| `STRIPE_WEBHOOK_SECRET` | 💳 Optional | Verify Stripe webhooks |
| `RESEND_API_KEY` | 📧 Optional | Send real emails (3k/month free) |
| `EMAIL_FROM` | 📧 Optional | From-address for emails |
| `SENTRY_DSN` | 🐛 Optional | Error monitoring |
| `UPSTASH_REDIS_REST_URL` | ⚡ Optional | Distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⚡ Optional | Distributed rate limiting |

### 3. Change the admin password IMMEDIATELY

After your first deploy:

1. Sign in with the seeded `admin123` password
2. Click **"Password"** in the admin sidebar
3. Set a strong, unique passphrase (12+ chars, mixed case + number)
4. Sign out and back in to verify

### 4. Deploy to Vercel (recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import the repo at https://vercel.com/new
# 3. Add all env vars from .env.example in the Vercel dashboard
# 4. Set NEXTAUTH_URL to your Vercel domain
# 5. Deploy — Vercel auto-detects Next.js + runs `prisma generate` via postinstall
# 6. After first deploy, run the seed once:
#    (Use Vercel's CLI: vercel env pull && bun run scripts/seed.ts && vercel env push)
```

### 5. Enable Stripe payments (optional)

```bash
# 1. Create a Stripe account → https://dashboard.stripe.com
# 2. Get your API keys from https://dashboard.stripe.com/apikeys
# 3. Set in .env:
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 4. Create a webhook endpoint in Stripe:
#    URL: https://yourdomain.com/api/stripe/webhook
#    Events: checkout.session.completed, charge.refunded

# 5. When STRIPE_SECRET_KEY is set, the checkout flow automatically
#    redirects to Stripe Checkout. When blank, orders are created
#    as "pay on delivery".
```

### 6. Enable email notifications (optional)

```bash
# 1. Create a Resend account → https://resend.com (3,000 free emails/month)
# 2. Verify your sending domain (rishaadbakers.com)
# 3. Get your API key
# 4. Set in .env:
RESEND_API_KEY=re_xxx
EMAIL_FROM="Rishaad Baker's <hello@rishaadbakers.com>"

# 5. When set, the app automatically sends:
#    - Lead enquiry confirmation → admin
#    - New order confirmation → admin + customer
# When blank, notifications log to the server console (dev mode).
```

### 7. Set up uptime monitoring (recommended)

Point an uptime monitor (UptimeRobot, Pingdom) at:
```
https://yourdomain.com/api/health
```
Returns `200 {"status":"ok"}` when healthy, `503` when DB is down.

## 🗂 SEO

- `sitemap.xml` auto-generated at `/sitemap.xml` (includes all products)
- `robots.txt` at `/robots.txt` (allows public pages, blocks /admin + /api)
- Open Graph + Twitter Card metadata in `src/app/layout.tsx`
- Semantic HTML throughout (WCAG 2.1 AA)
- Update `NEXTAUTH_URL` env var to your production domain for correct sitemap URLs

## 📝 License

MIT
