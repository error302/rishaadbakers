'use client'

import Link from 'next/link'
import { Cake, Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react'
import type { SiteSettings } from '@/lib/settings'

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Cake className="h-5 w-5" />
              </div>
              <span className="font-serif text-lg font-bold">{settings.storeName}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {settings.tagline}
            </p>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @rishaadbakers
            </a>
          </div>

          {/* Visit us */}
          <div>
            <h3 className="font-serif text-base font-semibold">Visit Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>{settings.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${settings.phone}`} className="hover:text-foreground transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${settings.email}`} className="hover:text-foreground transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-serif text-base font-semibold">Opening Hours</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p>{settings.hoursWeekday}</p>
                  <p>{settings.hoursWeekend}</p>
                  <p className="mt-1 text-xs italic">{settings.hoursClosed}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-serif text-base font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">
                  Full Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Baked with
            <span className="text-accent">♥</span>
            in Portland, Oregon
          </p>
        </div>
      </div>
    </footer>
  )
}
