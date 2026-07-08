import Link from 'next/link'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront/storefront-shell'
import { ContactForm } from './contact-form'
import { Card, CardContent } from '@/components/ui/card'
import { getSiteSettings } from '@/lib/settings'

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell>
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-10 md:px-6 md:py-14">
          <nav className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground">Contact</span>
          </nav>
          <h1 className="font-serif text-3xl font-bold md:text-5xl">Get in touch</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Questions about an order, dietary needs, or a custom cake? We&rsquo;d love to hear from you.
            We typically reply within one business day.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Contact info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">Visit the bakery</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{settings.address}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">Call us</h2>
                  <a href={`tel:${settings.phone}`} className="mt-1 block text-sm text-muted-foreground hover:text-foreground">
                    {settings.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">Email us</h2>
                  <a href={`mailto:${settings.email}`} className="mt-1 block text-sm text-muted-foreground hover:text-foreground">
                    {settings.email}
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <Clock className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">Opening hours</h2>
                  <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    <p>{settings.hoursWeekday}</p>
                    <p>{settings.hoursWeekend}</p>
                    <p className="text-xs italic">{settings.hoursClosed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="font-serif text-2xl font-bold">Send us a message</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  For custom cake enquiries please include the date, number of guests, and any theme or
                  dietary requirements. We&rsquo;ll get back to you within one business day.
                </p>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
