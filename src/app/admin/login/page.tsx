'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/storefront/theme-toggle'
import { Logo } from '@/components/storefront/logo'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'
  const [email, setEmail] = useState('admin@rishaadbakers.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<{ storeName: string; logoUrl: string; logoAlt: string } | null>(null)

  useEffect(() => {
    fetch('/api/site-info')
      .then((r) => r.json())
      .then((data) => {
        if (data?.storeName) {
          setSettings({ storeName: data.storeName, logoUrl: data.logoUrl, logoAlt: data.logoAlt })
        }
      })
      .catch(() => {
        // Ignore — fallback to plain text brand
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Invalid credentials')
      } else if (res?.ok) {
        toast.success('Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-bakery-gradient">
      <header className="flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo src={settings?.logoUrl ?? ''} alt={settings?.logoAlt ?? 'Logo'} size={40} />
          <span className="font-serif text-lg font-bold">{settings?.storeName ?? 'Admin'}</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-warm-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl">Admin Sign In</CardTitle>
            <CardDescription>
              Sign in to manage orders, products, and customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rishaadbakers.com"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-3 text-xs">
              <p className="font-semibold">Demo credentials</p>
              <p className="mt-1 text-muted-foreground">
                Email: <code className="rounded bg-background px-1 py-0.5">admin@rishaadbakers.com</code>
                <br />
                Password: <code className="rounded bg-background px-1 py-0.5">admin123</code>
              </p>
            </div>

            <Link
              href="/"
              className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              ← Back to storefront
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
