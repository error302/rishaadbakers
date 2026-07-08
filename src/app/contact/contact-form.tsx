'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please pick a subject'),
  message: z.string().min(10, 'Please tell us a little more'),
})

type ContactFormValues = z.infer<typeof contactSchema>

const SUBJECTS = [
  'Custom cake enquiry',
  'Existing order',
  'Allergy / dietary question',
  'Wholesale & catering',
  'Press / partnership',
  'Something else',
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  const subject = watch('subject')

  const onSubmit = async (data: ContactFormValues) => {
    // Simulate async submit (the form is purely front-end for this demo)
    await new Promise((r) => setTimeout(r, 600))
    console.log('Contact form submitted:', data)
    toast.success('Thanks! We\u2019ll be in touch within one business day.')
    setSubmitted(true)
    reset()
  }

  if (submitted) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-6 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <div>
          <p className="font-serif text-xl font-bold">Message sent</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks for reaching out — we&rsquo;ll reply within one business day.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name')} placeholder="Your full name" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...register('phone')} placeholder="+1 (555) 555-5555" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="subject">Subject *</Label>
          <Select
            value={subject}
            onValueChange={(v) => setValue('subject', v, { shouldValidate: true })}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="Pick a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          rows={6}
          {...register('message')}
          placeholder="Tell us about your event, dietary needs, or question..."
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
