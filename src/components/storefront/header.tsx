'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, ShoppingBag, X, Cake } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/store/cart'
import { CartSheet } from './cart-sheet'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const pathname = usePathname()
  const itemCount = useCart((s) => s.itemCount())
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground md:h-11 md:w-11">
            <Cake className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg font-bold tracking-tight md:text-xl">
              Rishaad Bakers
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Hand-crafted since 2014
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground hover:bg-accent/10'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {/* Cart */}
          <CartSheet>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10" aria-label="Open cart">
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>
          </CartSheet>

          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader className="mb-4">
                <SheetTitle className="text-left font-serif">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/80 hover:bg-accent/10 hover:text-foreground'
                      )}
                    >
                      {link.label}
                      {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Admin Login
                  <X className="h-3 w-3 opacity-0" />
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Admin link (desktop) */}
          <Link href="/admin/login" className="hidden md:block ml-1">
            <Button variant="outline" size="sm" className="h-9">
              Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
