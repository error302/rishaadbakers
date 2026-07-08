'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Settings,
  Menu,
  LogOut,
  Store,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/storefront/theme-toggle'
import { Logo } from '@/components/storefront/logo'

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Site',
    items: [
      { href: '/admin/content', label: 'Content & Wording', icon: FileText },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

function getPageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard'
  if (pathname.startsWith('/admin/products')) return 'Products'
  if (pathname.startsWith('/admin/orders')) return 'Orders'
  if (pathname.startsWith('/admin/categories')) return 'Categories'
  if (pathname.startsWith('/admin/customers')) return 'Customers'
  if (pathname.startsWith('/admin/content')) return 'Content & Wording'
  if (pathname.startsWith('/admin/settings')) return 'Settings'
  return 'Admin'
}

type AdminHeaderProps = {
  user?: { name?: string | null; email?: string | null }
  storeName?: string
  logoUrl?: string
  logoAlt?: string
}

export function AdminHeader({ user, storeName, logoUrl, logoAlt }: AdminHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const title = getPageTitle(pathname)

  if (pathname === '/admin/login') return null

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-sidebar-border px-4 py-4">
              <SheetTitle className="flex items-center gap-2.5 font-serif text-left">
                <Logo src={logoUrl ?? ''} alt={logoAlt ?? storeName ?? 'Logo'} size={36} />
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-bold">{storeName ?? 'Admin'}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <nav className="px-2 py-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-5">
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => {
                      const active =
                        pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-foreground/80 hover:bg-accent/10 hover:text-foreground'
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              <div className="mt-4 border-t border-border pt-3">
                <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Link href="/" target="_blank">
                    <Store className="h-4 w-4" /> View store
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="font-serif text-lg font-bold md:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Button asChild variant="outline" size="sm" className="hidden sm:flex">
          <Link href="/" target="_blank">
            <Store className="mr-1.5 h-4 w-4" />
            View store
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="hidden sm:flex"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
