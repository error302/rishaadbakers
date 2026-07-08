import Link from 'next/link'
import Image from 'next/image'
import { Award, Cake, Heart, Leaf, Sparkles, Users } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getSiteSettings } from '@/lib/settings'

export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bakery-hero">
        <div className="container mx-auto px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">Our Story</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-balance">
              A decade of whisking, piping, and feeding our neighbours.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              {settings.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* Story section */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85"
              alt="The Rishaad Bakers kitchen"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-serif text-3xl font-bold md:text-4xl">How it all began</h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Rishaad Bakers started in 2014 in a tiny apartment kitchen with a single hand-mixer,
                a battered copy of Julia Child&rsquo;s <em>The Way to Cook</em>, and a stubborn refusal
                to use shortening. The first order — a three-tier vanilla bean cake for a friend&rsquo;s
                wedding — fed 80 guests and started a word-of-mouth phenomenon across Portland.
              </p>
              <p>
                By 2017 we&rsquo;d outgrown the apartment and opened our first proper shop on Honeycrisp Lane.
                By 2020, we&rsquo;d hired our first three pastry chefs, installed a stone mill for our own
                almond flour, and begun sourcing single-estate Belgian chocolate directly from a family-run
                plantation. Today, we bake an average of 47 cakes a week — and we still hand-pipe every
                single buttercream rose.
              </p>
              <p>
                We&rsquo;re a small team of obsessives. We taste every batch. We toast our own nuts. We
                age our fruitcakes for three months before they leave the kitchen. We do this because
                we believe a cake should taste even better than it looks — and the only way to guarantee
                that is to make it ourselves, by hand, every single day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <p className="font-serif text-sm uppercase tracking-[0.3em] text-accent">What we believe</p>
            <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">Four things we never compromise on</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Leaf,
                title: 'Real ingredients',
                body: 'Single-estate chocolate, stone-milled almond flour, organic butter, free-range eggs. No shortening, no artificial flavours, no apologies.',
              },
              {
                icon: Heart,
                title: 'Made by hand',
                body: 'Every batter whisked, every flower piped, every macaron shell filled by a human — not a machine. We don\u2019t know how else to do it.',
              },
              {
                icon: Users,
                title: 'For our neighbours',
                body: 'We donate day-old pastries to the Old Town shelter, hire locally, and pay above-living wages. A bakery is only as good as the community around it.',
              },
              {
                icon: Award,
                title: 'Honest pricing',
                body: 'Our cakes cost what they cost because real ingredients and skilled labour aren\u2019t cheap. We\u2019d rather charge fair prices than cut corners.',
              },
            ].map((v, i) => (
              <Card key={i} className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team teaser */}
      <section className="container mx-auto px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1 flex flex-col gap-5">
            <h2 className="font-serif text-3xl font-bold md:text-4xl">Meet the bakers</h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Our team is small — just eight of us — but every single person here chose this work
                because they love it. Our head pastry chef, Maya, trained in Paris and Tokyo before
                coming home to Portland. Our croissant specialist, Tomas, wakes up at 3:30 AM every
                day to laminate the day&rsquo;s dough. Our decorator, Priya, can pipe 200 buttercream
                roses an hour without breaking rhythm.
              </p>
              <p>
                We&rsquo;re not a chain. We&rsquo;re not a factory. We&rsquo;re a neighbourhood bakery
                that happens to be very serious about cake — and very glad you stopped by.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div>
                <p className="font-serif text-3xl font-bold text-primary">8</p>
                <p className="mt-1 text-xs text-muted-foreground">Team members</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-primary">3</p>
                <p className="mt-1 text-xs text-muted-foreground">Pastry chefs</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-bold text-primary">1</p>
                <p className="mt-1 text-xs text-muted-foreground">Tiny shop</p>
              </div>
            </div>
            <Button asChild className="mt-2 w-fit">
              <Link href="/contact">Come say hello</Link>
            </Button>
          </div>
          <div className="order-1 relative aspect-[5/4] overflow-hidden rounded-3xl lg:order-2">
            <Image
              src="https://images.unsplash.com/photo-1605478371361-1ba83eed5cf5?w=1200&q=85"
              alt="The Rishaad Bakers team"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16 md:px-6 md:pb-24">
        <Card className="bg-primary p-8 text-primary-foreground md:p-12">
          <CardContent className="flex flex-col items-center gap-5 p-0 text-center">
            <Sparkles className="h-8 w-8" />
            <h2 className="font-serif text-2xl font-bold md:text-3xl">Hungry yet?</h2>
            <p className="max-w-xl text-primary-foreground/85">
              Walk in any morning for fresh croissants and a coffee, or order a custom cake for your
              next celebration. We&rsquo;re open Tuesday through Sunday.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary">
                <Link href="/menu">Browse the menu</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/contact">Order a custom cake</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </StorefrontShell>
  )
}
