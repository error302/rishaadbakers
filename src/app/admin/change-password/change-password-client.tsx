'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, Save, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(12, 'Must be at least 12 characters')
    .max(200)
    .regex(/[a-z]/, 'Add a lowercase letter')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[0-9]/, 'Add a number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export function ChangePasswordClient() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  watch((data) => setNewPassword(data.newPassword ?? ''))

  // Password strength meter
  const strength = (() => {
    let score = 0
    if (newPassword.length >= 12) score++
    if (newPassword.length >= 16) score++
    if (/[a-z]/.test(newPassword)) score++
    if (/[A-Z]/.test(newPassword)) score++
    if (/[0-9]/.test(newPassword)) score++
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++
    return score
  })()
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong', 'Excellent'][strength]
  const strengthColor = ['bg-muted', 'bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-600', 'bg-emerald-700'][strength]

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to change password' }))
        throw new Error(err.error ?? 'Failed to change password')
      }
      toast.success('Password changed successfully')
      reset()
      // Redirect back to dashboard after a short delay
      setTimeout(() => router.push('/admin'), 1500)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-9 w-9">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="font-serif text-2xl font-bold">Change Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your admin password. Use a strong, unique passphrase.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-serif text-lg">
            <KeyRound className="h-4 w-4 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Your password is hashed with bcrypt (12 rounds) and never stored in plaintext.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Current password */}
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Current password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  {...register('currentPassword')}
                  className="pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>

            {/* New password */}
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">New password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  {...register('newPassword')}
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${strengthColor}`}
                      style={{ width: `${(strength / 6) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Strength: {strengthLabel}</p>
                </div>
              )}
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>

            {/* Confirm password */}
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm new password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            {/* Requirements */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <p className="font-semibold">Password requirements:</p>
              <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                <li className={`flex items-center gap-1.5 ${newPassword.length >= 12 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  <span>{newPassword.length >= 12 ? '✓' : '○'}</span> At least 12 characters
                </li>
                <li className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  <span>{/[a-z]/.test(newPassword) ? '✓' : '○'}</span> Lowercase letter
                </li>
                <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  <span>{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span> Uppercase letter
                </li>
                <li className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  <span>{/[0-9]/.test(newPassword) ? '✓' : '○'}</span> Number
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button asChild variant="outline" type="button">
                <Link href="/admin">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security tips */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold">Security best practices</p>
              <ul className="mt-1.5 space-y-1 text-muted-foreground">
                <li>• Use a unique password — never reuse one from another site.</li>
                <li>• Consider a passphrase: 4+ random words are easier to remember and harder to crack.</li>
                <li>• Use a password manager (1Password, Bitwarden, KeePass) to generate and store it.</li>
                <li>• Never share your password — even with other staff. Each admin should have their own account.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
