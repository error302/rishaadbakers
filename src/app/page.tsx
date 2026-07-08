import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Cake, Cookie, Croissant, CupSoda, Heart, Leaf, Sparkles, Star, Truck, GraduationCap, CheckCircle2, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { ProductCard } from '@/components/storefront/product-card'
import { getCategories, getProducts } from '@/lib/queries'
import { getSiteSettings } from '@/lib/settings'
import { formatPrice } from '@/lib/format'

const CATEGORY_ICCONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'signature-cakes': Cake,
  cupcakes: CupSoda,
  pastries: Croissant,
  'cookies-treats': Cookie,
  'custom-cakes': Sparkles,
}

export default async function Home() {
  const [settings, categories, featured] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
  ])

  const schoolItems = settings.schoolItemsLearned.split('\n').filter(Boolean)
  const schoolFeatures = settings.schoolFeatures.split('\n').filter(Boolean)
  const whatsappLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    `Hello! I'd like to book a spot in the ${settings.schoolProgramName}.`
  )}`

  return (
    <StorefrontShell>
      {/* ────────── Hero ────────── */}
      <section className="relative overflow-hidden bg-bakery-hero">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24 lg:py-32">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <Badge variant="secondary" className="mx-auto w-fit gap-1.5 px-3 py-1.5 lg:mx-0">
                <Sparkles className="h-3 w-3" />
                {settings.heroBadge}
              </Badge>
              <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl xl:text-7xl">
                {settings.heroHeadline}
                <span className="block text-accent">{settings.heroHeadlineAccent}</span>
              </h1>
              <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg lg:mx-0">
                {settings.heroSubtext}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-start justify-center">
                <Button asChild size="lg" className="h-12 px-7 text-base">
                  <Link href="/menu">
                    {settings.heroCtaPrimary}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                  <Link href="/about">{settings.heroCtaSecondary}</Link>
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <Leaf className="h-4 w-4 text-primary" />
                  All-natural ingredients
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-accent" />
                  Hand-decorated
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  Local delivery
                </span>
              </div>
            </div>

            <div className="relative aspect-square w-full max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-warm-lg">
                <Image
                  src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=85"
                  alt="Hand-decorated celebration cake from Rishaad Baker's"
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute -left-4 bottom-6 hidden rounded-2xl bg-background p-3 shadow-warm-lg md:block md:-left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">4.9 / 5.0</p>
                    <p className="text-xs text-muted-foreground">2,400+ happy customers</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-2 top-6 hidden rounded-2xl bg-background p-3 shadow-warm-lg md:block md:-right-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15">
                    <Cake className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">10,000+ cakes</p>
                    <p className="text-xs text-muted-foreground">baked &amp; loved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Categories ────────── */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-20">
        <div className="mb-10 text-center">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Explore</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">A little something for everyone</h2>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            From three-tier showstoppers to a single butter croissant — pick a category and find your favourite.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const Icon = CATEGORY_ICCONS[c.slug] ?? Cake
            return (
              <Link
                key={c.id}
                href={`/menu?category=${c.slug}`}
                className="group relative aspect-square overflow-hidden rounded-2xl"
              >
                <Image
                  src={c.imageUrl ?? '/placeholder.svg'}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center text-white">
                  <Icon className="mb-2 h-6 w-6 opacity-90" />
                  <h3 className="font-serif text-base font-semibold md:text-lg">{c.name}</h3>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">Shop now</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ────────── Featured cakes ────────── */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 flex flex-col items-end justify-between gap-4 sm:flex-row">
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Crowd favourites</p>
              <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">This week&rsquo;s featured bakes</h2>
            </div>
            <Button asChild variant="ghost" className="gap-1.5">
              <Link href="/menu">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ────────── School / Baking Class section ────────── */}
      {settings.schoolEnabled && (
        <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <Card className="overflow-hidden border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5">
            <div className="grid gap-8 p-6 md:grid-cols-2 md:p-10 lg:p-12">
              {/* Left: details */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent">
                    <GraduationCap className="h-3 w-3" />
                    {settings.schoolBadge}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    {settings.schoolDuration}
                  </Badge>
                </div>
                <div>
                  <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">
                    {settings.schoolSubheadline}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                    {settings.schoolHeadline}
                  </h2>
                </div>
                <p className="text-base text-muted-foreground">{settings.schoolIntro}</p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {schoolFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 rounded-xl border border-border bg-background p-5 shadow-warm sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Program</p>
                    <p className="font-serif text-lg font-bold">{settings.schoolProgramName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                    <p className="font-serif text-lg font-bold">{settings.schoolDuration}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>
                    <p className="font-serif text-lg font-bold text-accent">{settings.schoolPrice}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="h-12 gap-2">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-5 w-5" />
                      {settings.schoolUrgency}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 gap-2">
                    <Link href="/school">
                      View full details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  {settings.schoolNote}
                </p>
              </div>

              {/* Right: items you'll learn */}
              <div className="flex flex-col gap-4 rounded-xl bg-background p-5 shadow-warm md:p-6">
                <div>
                  <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">You will learn</p>
                  <h3 className="mt-1 font-serif text-xl font-bold">{schoolItems.length} recipes &amp; techniques</h3>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {schoolItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-sm">
                      <Cake className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 rounded-lg bg-accent/10 p-4 text-center">
                  <p className="font-serif text-lg font-bold text-accent">{settings.schoolCtaText}</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{settings.schoolContact}:</span>
                  <a href={`tel:${settings.schoolContactPhone}`} className="font-semibold hover:text-primary">
                    {settings.schoolContactPhone}
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ────────── About teaser ────────── */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85"
              alt="Inside the Rishaad Baker's kitchen"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Our Story</p>
            <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
              {settings.aboutTitle}
            </h2>
            <p className="text-base text-muted-foreground">
              {settings.about}
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <p className="font-serif text-3xl font-bold text-primary">10+</p>
                <p className="mt-1 text-xs text-muted-foreground">Years of baking</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-primary">10k+</p>
                <p className="mt-1 text-xs text-muted-foreground">Cakes made</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-primary">4.9★</p>
                <p className="mt-1 text-xs text-muted-foreground">Customer rating</p>
              </div>
            </div>
            <Button asChild className="mt-2 w-fit">
              <Link href="/about">
                {settings.aboutCtaText}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ────────── Testimonials ────────── */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 text-center">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Kind words</p>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">From our customers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  'The vanilla bean layer cake was the centrepiece of my mother\u2019s 70th birthday. Three days later and people are still texting me about it.',
                name: 'Priya M.',
                role: 'Birthday celebration',
              },
              {
                quote:
                  'We ordered a bespoke three-tier wedding cake. Not only was it gorgeous, every single guest asked who made it. The pistachio rose flavour is unreal.',
                name: 'Daniel & Aisha',
                role: 'Wedding, June 2024',
              },
              {
                quote:
                  'I stop in every Saturday for croissants and a macaron box. The butter croissant is the best in Mombasa — and I\u2019ve tried them all.',
                name: 'Tom B.',
                role: 'Weekly regular',
              },
            ].map((t, i) => (
              <Card key={i} className="flex h-full flex-col gap-4 p-6">
                <CardContent className="flex flex-1 flex-col gap-4 p-0">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-serif text-sm font-bold text-primary">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <Card className="overflow-hidden border-none bg-primary p-0 text-primary-foreground">
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
            <div className="flex flex-col gap-5">
              <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-balance">
                Dreaming of a custom cake?
              </h2>
              <p className="text-primary-foreground/85">
                Weddings, birthdays, milestones — bring us your idea and we&rsquo;ll bring it to life.
                48 hours notice for celebration cakes; two weeks for bespoke multi-tier designs.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="h-12 px-7">
                  <Link href="/contact">Start a custom order</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-7 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link href="/menu">See custom cakes</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1200&q=85"
                alt="Custom birthday cake"
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </Card>
      </section>
    </StorefrontShell>
  )
}
