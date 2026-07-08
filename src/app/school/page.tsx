import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Heart,
  MessageCircle,
  Phone,
  Clock,
  Users,
  Award,
  Cake,
  AlertCircle,
} from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSiteSettings } from '@/lib/settings'

export default async function SchoolPage() {
  const settings = await getSiteSettings()
  const schoolItems = settings.schoolItemsLearned.split('\n').filter(Boolean)
  const schoolFeatures = settings.schoolFeatures.split('\n').filter(Boolean)
  const whatsappLink = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    `Hello! I'd like to book a spot in the ${settings.schoolProgramName}.`
  )}`

  return (
    <StorefrontShell>
      {/* ────────── Hero ────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/15 via-background to-primary/10">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mx-auto mb-5 w-fit gap-1.5 px-3 py-1.5">
              <GraduationCap className="h-3 w-3" />
              {settings.schoolBadge}
            </Badge>
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">
              {settings.schoolSubheadline}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-6xl text-balance">
              {settings.schoolHeadline}
            </h1>
            <p className="mt-5 text-lg text-muted-foreground md:text-xl">{settings.schoolIntro}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 gap-2 px-7 text-base">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Book Your Spot on WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 gap-2 px-7 text-base">
                <a href={`tel:${settings.schoolContactPhone}`}>
                  <Phone className="h-4 w-4" />
                  Call: {settings.schoolContactPhone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Stats bar ────────── */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto grid grid-cols-2 divide-x divide-border px-4 md:grid-cols-4 md:px-6">
          <div className="px-4 py-6 text-center">
            <Clock className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-serif text-2xl font-bold">{settings.schoolDuration}</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div className="px-4 py-6 text-center">
            <Award className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-serif text-2xl font-bold">{settings.schoolPrice}</p>
            <p className="text-xs text-muted-foreground">Total price</p>
          </div>
          <div className="px-4 py-6 text-center">
            <Cake className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-serif text-2xl font-bold">{schoolItems.length}</p>
            <p className="text-xs text-muted-foreground">Recipes taught</p>
          </div>
          <div className="px-4 py-6 text-center">
            <Users className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-serif text-2xl font-bold">Small</p>
            <p className="text-xs text-muted-foreground">Class size</p>
          </div>
        </div>
      </section>

      {/* ────────── What you'll learn ────────── */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="mb-10 text-center">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Curriculum</p>
          <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">What you&rsquo;ll learn</h2>
          <p className="mt-3 mx-auto max-w-xl text-muted-foreground">
            {schoolItems.length} recipes, icings, and techniques — each one taught from scratch with step-by-step guidance.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schoolItems.map((item, i) => (
            <Card key={i} className="group overflow-hidden">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Cake className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Module {String(i + 1).padStart(2, '0')}</p>
                  <p className="font-medium">{item}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ────────── Features + image ────────── */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85"
                alt="Students learning to bake at Rishaad Baker's class"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Why our class</p>
              <h2 className="font-serif text-3xl font-bold leading-tight md:text-4xl">
                Built for absolute beginners
              </h2>
              <p className="text-base text-muted-foreground">
                No experience required. Our {settings.schoolProgramName} is designed to take you from
                &ldquo;I&rsquo;ve never baked&rdquo; to &ldquo;I just sold my first cake&rdquo; in {settings.schoolDuration.toLowerCase()}.
                Every session is hands-on, every recipe is yours to keep, and every bake goes home with you.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {schoolFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Pricing card ────────── */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <Card className="mx-auto max-w-2xl overflow-hidden border-2 border-accent/40 shadow-warm-lg">
          <div className="bg-gradient-to-br from-accent/10 via-background to-primary/5 p-8 text-center md:p-12">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Enrolment</p>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{settings.schoolProgramName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">All materials list provided · Recipes included</p>

            <div className="mt-8 flex items-end justify-center gap-2">
              <span className="text-lg text-muted-foreground">Total</span>
              <span className="font-serif text-5xl font-bold text-accent">{settings.schoolPrice}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              for the full {settings.schoolDuration} program
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="h-12 gap-2 px-7 text-base">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Book on WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 gap-2 px-7 text-base">
                <a href={`tel:${settings.schoolContactPhone}`}>
                  <Phone className="h-4 w-4" />
                  Call to enrol
                </a>
              </Button>
            </div>

            <div className="mt-6 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              <p className="flex items-start justify-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{settings.schoolUrgency}</span>
              </p>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            <h3 className="mb-4 font-serif text-lg font-semibold">What&rsquo;s included</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                ...schoolItems.map((i) => `Recipe: ${i}`),
                'Hands-on practical every session',
                'Recipes & tips booklet',
                'Step-by-step guidance',
                'Take-home baked products',
              ].slice(0, 8).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                <span>{settings.schoolNote}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="container mx-auto px-4 pb-16 md:px-6 md:pb-24">
        <Card className="bg-primary p-8 text-center text-primary-foreground md:p-12">
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <Sparkles className="h-8 w-8" />
            <h2 className="font-serif text-2xl font-bold md:text-3xl">{settings.schoolCtaText}</h2>
            <p className="max-w-xl text-primary-foreground/85">
              {settings.schoolContact}: <a href={`tel:${settings.schoolContactPhone}`} className="font-semibold underline">{settings.schoolContactPhone}</a>
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Message on WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/menu">
                  <Cake className="h-4 w-4" />
                  See our cakes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </StorefrontShell>
  )
}
