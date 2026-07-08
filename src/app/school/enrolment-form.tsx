'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send, CheckCircle2, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const enrolSchema = z.object({
  name: z.string().min(2, 'Please enter your full name').max(100),
  email: z.string().email('Please enter a valid email').max(200),
  phone: z.string().min(5, 'Please enter a valid phone number').max(40),
  preferredStart: z.string().max(200).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
})

type EnrolFormValues = z.infer<typeof enrolSchema>

type EnrolmentFormProps = {
  programName: string
  whatsappPhone: string
}

export function EnrolmentForm({ programName, whatsappPhone }: EnrolmentFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnrolFormValues>({ resolver: zodResolver(enrolSchema) })

  const onSubmit = async (data: EnrolFormValues) => {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        programInterest: programName,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed' }))
      throw new Error(err.error ?? 'Submission failed')
    }
    toast.success('Enquiry submitted — we\u2019ll be in touch within one business day!')
    setSubmitted(true)
    reset()
  }

  if (submitted) {
    return (
      <Card className="border-2 border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold">Thank you for enquiring!</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Your enquiry has been received. Our team will reach out within one business day
              to confirm availability and next steps. For an instant response, message us on WhatsApp.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="gap-2">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
                  `Hi! I just submitted an enrolment enquiry for the ${programName}. I'd like to confirm my spot.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSubmitted(false)}
            >
              Submit another enquiry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-accent/30 shadow-warm-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-serif text-xl">Reserve your spot</CardTitle>
            <CardDescription>
              Fill in the form below — we&rsquo;ll confirm availability within one business day.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone / WhatsApp *</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="0724 266 695"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="preferredStart">Preferred start (optional)</Label>
              <Input
                id="preferredStart"
                {...register('preferredStart')}
                placeholder="e.g. Next cohort, January 2026"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="message">Anything else we should know? (optional)</Label>
            <Textarea
              id="message"
              rows={4}
              {...register('message')}
              placeholder="Tell us about your baking experience, dietary interests, or any questions you have..."
            />
            {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              By submitting, you agree to be contacted about the {programName}. We respect your privacy.
            </p>
            <Button type="submit" disabled={isSubmitting} className="gap-2 sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit enquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
