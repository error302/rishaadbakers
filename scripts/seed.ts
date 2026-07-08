// Rishaad Bakers — Seed script
// Run with: bun run scripts/seed.ts
//
// Seeds:
//   - 1 admin user (admin@rishaadbakers.com / admin123)
//   - 5 categories
//   - 14 sample products with Unsplash imagery
//   - Site settings (store name, phone, address, hours, delivery fee)
//   - 4 demo customers + 7 sample orders

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const db = new PrismaClient()

// Simple SHA-256 hash with salt (matches our auth helper — sufficient for demo admin).
// In production this would be bcrypt/argon2.
function hashPassword(password: string): string {
  const salt = 'rishaad-bakers-salt-v1'
  return createHash('sha256').update(salt + password).digest('hex')
}

async function main() {
  console.log('🌱 Seeding Rishaad Bakers database...')

  // ── Admin user ──────────────────────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: 'admin@rishaadbakers.com' },
    update: {},
    create: {
      email: 'admin@rishaadbakers.com',
      name: 'Rishaad Admin',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
    },
  })
  console.log(`  ✓ Admin user: ${admin.email}`)

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all(
    [
      { name: 'Signature Cakes', slug: 'signature-cakes', description: 'Hand-crafted layer cakes baked fresh daily, our pride and joy.', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80' },
      { name: 'Cupcakes', slug: 'cupcakes', description: 'Petite treats crowned with silky buttercream — perfect for any celebration.', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80' },
      { name: 'Pastries', slug: 'pastries', description: 'Flaky, buttery, and impossibly light — baked each morning before sunrise.', sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40486035?w=800&q=80' },
      { name: 'Cookies & Treats', slug: 'cookies-treats', description: 'Crunchy, chewy, and chocolate-studded — the small joys of life.', sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80' },
      { name: 'Custom Cakes', slug: 'custom-cakes', description: 'Your vision, our craft. Bespoke cakes for weddings, birthdays, and milestones.', sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80' },
    ].map((c) =>
      db.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  )
  console.log(`  ✓ ${categories.length} categories`)

  const [cakes, cupcakes, pastries, cookies, custom] = categories

  // ── Products ────────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Classic Vanilla Bean Layer Cake',
      slug: 'vanilla-bean-layer-cake',
      description: 'Three layers of moist Madagascar vanilla bean sponge, layered with silky Swiss meringue buttercream and a whisper of raspberry compote. Our most-loved celebration cake.',
      priceCents: 4800,
      categoryId: cakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80',
      gallery: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80'],
      isFeatured: true,
      stock: 12,
      dietary: ['vegetarian'],
      ingredients: 'Madagascar vanilla, organic flour, free-range eggs, European butter, cane sugar, raspberry',
      weightGrams: 1200,
      servesPeople: 12,
    },
    {
      name: 'Belgian Chocolate Fudge Cake',
      slug: 'belgian-chocolate-fudge-cake',
      description: 'Deep, dark, and decadent. Double-dark Belgian cocoa sponge with whipped dark chocolate ganache and a glossy fudge glaze.',
      priceCents: 5200,
      categoryId: cakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=80',
      gallery: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=80'],
      isFeatured: true,
      stock: 8,
      dietary: ['vegetarian'],
      ingredients: 'Belgian cocoa, dark chocolate (70%), butter, flour, eggs, sugar, cream',
      weightGrams: 1200,
      servesPeople: 12,
    },
    {
      name: 'Strawberry Rose Cream Cake',
      slug: 'strawberry-rose-cream-cake',
      description: 'Vanilla sponge layered with fresh strawberry compote and rose-scented Chantilly cream. Topped with hand-piped buttercream roses.',
      priceCents: 5500,
      categoryId: cakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80',
      gallery: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&q=80'],
      isFeatured: true,
      stock: 6,
      dietary: ['vegetarian'],
      ingredients: 'Vanilla sponge, fresh strawberries, rose water, cream, butter, sugar',
      weightGrams: 1100,
      servesPeople: 10,
    },
    {
      name: 'Lemon Elderflower Cake',
      slug: 'lemon-elderflower-cake',
      description: 'Bright Meyer lemon sponge brushed with elderflower syrup, layered with white chocolate buttercream and lemon curd.',
      priceCents: 5400,
      categoryId: cakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1622797380229-5ae4d05c1b1f?w=900&q=80',
      isFeatured: false,
      stock: 7,
      dietary: ['vegetarian'],
      ingredients: 'Meyer lemon, elderflower, white chocolate, butter, flour, eggs',
      weightGrams: 1100,
      servesPeople: 10,
    },
    {
      name: 'Red Velvet Cupcake (set of 6)',
      slug: 'red-velvet-cupcakes-6',
      description: 'Cocoa-kissed crimson cupcakes with a hint of buttermilk, crowned with tangy cream cheese frosting and a delicate sprinkle of cake crumbs.',
      priceCents: 2400,
      categoryId: cupcakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=900&q=80',
      isFeatured: true,
      stock: 20,
      dietary: ['vegetarian'],
      ingredients: 'Cocoa, buttermilk, cream cheese, butter, flour, eggs, beet extract',
      weightGrams: 540,
      servesPeople: 6,
    },
    {
      name: 'Salted Caramel Cupcake (set of 6)',
      slug: 'salted-caramel-cupcakes-6',
      description: 'Brown sugar sponge filled with molten salted caramel, topped with caramel buttercream, a caramel drizzle, and flaky sea salt.',
      priceCents: 2600,
      categoryId: cupcakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900&q=80',
      isFeatured: false,
      stock: 18,
      dietary: ['vegetarian'],
      ingredients: 'Brown sugar, salted caramel, butter, cream, flour, sea salt',
      weightGrams: 540,
      servesPeople: 6,
    },
    {
      name: 'Pistachio Rose Cupcake (set of 6)',
      slug: 'pistachio-rose-cupcakes-6',
      description: 'Ground pistachio sponge with a whisper of rose water, topped with pistachio buttercream, crushed pistachios, and dried rose petals.',
      priceCents: 2800,
      categoryId: cupcakes.id,
      imageUrl: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=900&q=80',
      isFeatured: false,
      stock: 14,
      dietary: ['vegetarian'],
      ingredients: 'Pistachio, rose water, butter, flour, eggs, sugar',
      weightGrams: 540,
      servesPeople: 6,
    },
    {
      name: 'Butter Croissant',
      slug: 'butter-croissant',
      description: 'Twenty-seven layers of laminated European butter and dough, baked to a deep golden crisp. Shatters at first bite.',
      priceCents: 450,
      categoryId: pastries.id,
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40486035?w=900&q=80',
      isFeatured: true,
      stock: 40,
      dietary: ['vegetarian'],
      ingredients: 'European butter, flour, milk, yeast, sugar, salt',
      weightGrams: 80,
      servesPeople: 1,
    },
    {
      name: 'Pain au Chocolat',
      slug: 'pain-au-chocolat',
      description: 'Flaky croissant dough wrapped around two batons of single-origin dark chocolate. A Parisian breakfast in three bites.',
      priceCents: 550,
      categoryId: pastries.id,
      imageUrl: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=900&q=80',
      isFeatured: false,
      stock: 32,
      dietary: ['vegetarian'],
      ingredients: 'Butter, flour, dark chocolate batons, milk, yeast',
      weightGrams: 90,
      servesPeople: 1,
    },
    {
      name: 'Almond Danish',
      slug: 'almond-danish',
      description: 'Tender laminated dough filled with frangipane almond cream, topped with toasted sliced almonds and a snowfall of powdered sugar.',
      priceCents: 600,
      categoryId: pastries.id,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=900&q=80',
      isFeatured: false,
      stock: 24,
      dietary: ['vegetarian'],
      ingredients: 'Almond frangipane, butter, almonds, flour, eggs, sugar',
      weightGrams: 110,
      servesPeople: 1,
    },
    {
      name: 'Brown Butter Chocolate Chip Cookies (set of 8)',
      slug: 'brown-butter-chocolate-chip-cookies-8',
      description: 'Cookies with crisp edges and chewy centers, made with nutty brown butter, two kinds of chocolate, and a pinch of flaky salt.',
      priceCents: 1800,
      categoryId: cookies.id,
      imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=900&q=80',
      isFeatured: true,
      stock: 35,
      dietary: ['vegetarian'],
      ingredients: 'Brown butter, dark & milk chocolate, flour, brown sugar, eggs, sea salt',
      weightGrams: 320,
      servesPeople: 8,
    },
    {
      name: 'French Macaron Assortment (set of 12)',
      slug: 'french-macaron-assortment-12',
      description: 'A dozen jewel-bright macarons in six seasonal flavors: pistachio, raspberry, vanilla, chocolate, lemon, and salted caramel.',
      priceCents: 3200,
      categoryId: cookies.id,
      imageUrl: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=900&q=80',
      isFeatured: true,
      stock: 22,
      dietary: ['gluten-free', 'vegetarian'],
      ingredients: 'Almond flour, egg whites, sugar, flavored buttercream fillings',
      weightGrams: 240,
      servesPeople: 12,
    },
    {
      name: 'Bespoke Wedding Cake (consultation)',
      slug: 'bespoke-wedding-cake-consultation',
      description: 'Your wedding, your cake. Book a private consultation with our head pastry chef to design a multi-tier cake tailored to your theme, flavors, and story.',
      priceCents: 35000,
      categoryId: custom.id,
      imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=900&q=80',
      isFeatured: true,
      stock: 5,
      dietary: ['vegetarian'],
      ingredients: 'Custom — chosen during consultation',
      weightGrams: 6000,
      servesPeople: 100,
    },
    {
      name: 'Birthday Themed Custom Cake',
      slug: 'birthday-themed-custom-cake',
      description: 'A two-tier celebration cake customized to your theme — choose your flavors, colors, and message. 48 hours notice required.',
      priceCents: 9500,
      categoryId: custom.id,
      imageUrl: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=900&q=80',
      isFeatured: false,
      stock: 10,
      dietary: ['vegetarian'],
      ingredients: 'Custom flavors and decorations — chosen at order time',
      weightGrams: 2200,
      servesPeople: 20,
    },
  ]

  for (const p of products) {
    const { gallery, dietary, ...rest } = p
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        galleryJson: JSON.stringify(gallery ?? []),
        dietaryJson: JSON.stringify(dietary ?? []),
      },
    })
  }
  console.log(`  ✓ ${products.length} products`)

  // ── Site settings ───────────────────────────────────────────────────────────
  const settings: Record<string, string> = {
    'store.name': "Rishaad Baker's",
    'store.tagline': 'Delicious Taste — Hand-crafted cakes, baked with love',
    'store.logoUrl': '/rishaad-logo.jpeg',
    'store.logoAlt': "Rishaad Baker's logo — Delicious Taste",

    'hero.badge': 'Baked fresh every morning',
    'hero.headline': 'Cakes worth',
    'hero.headlineAccent': 'celebrating',
    'hero.subtext':
      "Hand-crafted layer cakes, cupcakes, pastries, and bespoke celebration cakes. Every layer is whisked by hand, every flower piped with care, and every bite made with the kind of ingredients we'd feed our own families.",
    'hero.ctaPrimary': 'Browse the Menu',
    'hero.ctaSecondary': 'Our Story',

    'about.title': 'From a home kitchen to a neighbourhood institution.',
    'about.body':
      "Rishaad Baker's began in a tiny home kitchen with one simple goal: to bake cakes that taste as good as they look. A decade later, we still whisk every batter by hand, source our chocolate from a single Belgian estate, and refuse to use anything we wouldn't feed our own families. Every cake that leaves our shop carries our name — and our promise.",
    'about.ctaText': 'Read more about us',

    'footer.tagline': 'Delicious Taste — Hand-crafted cakes, baked with love',
    'footer.copyright': "Rishaad Baker's. All rights reserved.",

    'store.phone': '0724 266 695',
    'store.email': 'hello@rishaadbakers.com',
    'store.address': 'Nairobi, Kenya',
    'store.hours.weekday': 'Tue–Fri: 8:00 AM – 6:00 PM',
    'store.hours.weekend': 'Sat–Sun: 9:00 AM – 5:00 PM',
    'store.hours.closed': 'Closed Mondays',
    'store.instagram': 'https://instagram.com/rishaadbakers',
    'store.whatsapp': '254724266695',

    'school.enabled': 'true',
    'school.headline': 'BEGINNER BAKING CLASS',
    'school.subheadline': 'LEARN. BAKE. EARN!',
    'school.badge': 'Now enrolling',
    'school.intro':
      "Turn your passion for baking into profit. Join our hands-on beginner baking class and learn to make 11 different cakes, cookies, icings, and a honeycomb — all in six weeks, with recipes and step-by-step guidance included.",
    'school.programName': 'Beginner Baking Class',
    'school.price': '15,000',
    'school.duration': '6 Weeks',
    'school.itemsLearned': [
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
    'school.features': [
      'Hands-On Practicals',
      'Beginner Friendly',
      'Step-By-Step Guidance',
      'Small Class Size',
      'Recipes & Tips Included',
    ].join('\n'),
    'school.ctaText': 'TURN YOUR PASSION INTO PROFIT!',
    'school.urgency': 'LIMITED SLOTS! BOOK YOUR SPOT NOW!',
    'school.note':
      'NOTE: All students carry their baked products home. Students are to buy their own tools.',
    'school.contact': 'For More Info',
    'school.contactPhone': '0724 266 695',

    'store.deliveryFeeCents': '500',
    'store.freeDeliveryThresholdCents': '7500',
  }
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
  console.log(`  ✓ ${Object.keys(settings).length} site settings`)

  // ── Demo customers & orders (so the admin dashboard has data to show) ───────
  // Wipe existing demo orders first so the seed is idempotent (re-runnable)
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.customer.deleteMany()

  const demoCustomers = [
    { name: 'Amara Patel', email: 'amara.patel@example.com', phone: '+1 (503) 555-0142', address: '88 Willow St, Portland, OR 97201' },
    { name: 'Marcus Chen', email: 'marcus.chen@example.com', phone: '+1 (503) 555-0173', address: '15 Cedar Ave, Portland, OR 97205' },
    { name: 'Sofia Hernandez', email: 'sofia.h@example.com', phone: '+1 (503) 555-0119', address: '210 Maple Dr, Portland, OR 97209' },
    { name: 'James O\u2019Connell', email: 'james.o@example.com', phone: '+1 (503) 555-0188', address: '7 Birch Ln, Portland, OR 97202' },
  ]
  const createdCustomers = await Promise.all(
    demoCustomers.map((c) =>
      db.customer.upsert({
        where: { email: c.email },
        update: {},
        create: c,
      })
    )
  )
  console.log(`  ✓ ${createdCustomers.length} demo customers`)

  const allProducts = await db.product.findMany()
  const sampleOrders = [
    { customerIdx: 0, status: 'COMPLETED', daysAgo: 2, items: [0, 11] },
    { customerIdx: 1, status: 'PROCESSING', daysAgo: 0, items: [1, 7] },
    { customerIdx: 2, status: 'PENDING', daysAgo: 0, items: [2, 4] },
    { customerIdx: 3, status: 'COMPLETED', daysAgo: 5, items: [12] },
    { customerIdx: 0, status: 'COMPLETED', daysAgo: 8, items: [10, 8] },
    { customerIdx: 1, status: 'COMPLETED', daysAgo: 12, items: [0] },
    { customerIdx: 2, status: 'CANCELLED', daysAgo: 3, items: [13] },
  ]

  let orderCounter = 1000
  for (const o of sampleOrders) {
    orderCounter += 1
    const customer = createdCustomers[o.customerIdx]
    const items = o.items.map((idx) => allProducts[idx])
    const subtotalCents = items.reduce((sum, p) => sum + p.priceCents, 0)
    const deliveryCents = subtotalCents >= 7500 ? 0 : 500
    const totalCents = subtotalCents + deliveryCents

    const created = new Date()
    created.setDate(created.getDate() - o.daysAgo)

    const order = await db.order.create({
      data: {
        orderNumber: `RB-${orderCounter}`,
        customerId: customer.id,
        status: o.status,
        subtotalCents,
        deliveryCents,
        totalCents,
        notes: 'Please leave at the front door.',
        allergyNotes: o.customerIdx === 1 ? 'Nut allergy — please ensure no cross-contamination.' : null,
        deliveryDate: new Date(created.getTime() + 86400000),
        deliveryTime: '14:00',
        deliveryAddr: customer.address,
        createdAt: created,
        updatedAt: created,
        orderItems: {
          create: items.map((p) => ({
            productId: p.id,
            productName: p.name,
            productImage: p.imageUrl,
            unitPriceCents: p.priceCents,
            quantity: 1,
            subtotalCents: p.priceCents,
          })),
        },
      },
    })
    console.log(`    • Order ${order.orderNumber} (${order.status}) — $${(totalCents / 100).toFixed(2)}`)
  }

  console.log('\n✅ Seed complete.')
  console.log('   Admin login: admin@rishaadbakers.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
