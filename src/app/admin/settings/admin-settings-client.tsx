'use client'

import { useState } from 'react'
import { Loader2, Save, Store, Truck, Clock, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { SETTING_KEYS, type SiteSettings } from '@/lib/settings'

type Props = { settings: SiteSettings }

export function AdminSettingsClient({ settings }: Props) {
  const [form, setForm] = useState({
    [SETTING_KEYS.storeName]: settings.storeName,
    [SETTING_KEYS.tagline]: settings.tagline,
    [SETTING_KEYS.phone]: settings.phone,
    [SETTING_KEYS.email]: settings.email,
    [SETTING_KEYS.address]: settings.address,
    [SETTING_KEYS.hoursWeekday]: settings.hoursWeekday,
    [SETTING_KEYS.hoursWeekend]: settings.hoursWeekend,
    [SETTING_KEYS.hoursClosed]: settings.hoursClosed,
    [SETTING_KEYS.instagram]: settings.instagram,
    [SETTING_KEYS.deliveryFeeCents]: String(settings.deliveryFeeCents / 100),
    [SETTING_KEYS.freeDeliveryThresholdCents]: String(settings.freeDeliveryThresholdCents / 100),
    [SETTING_KEYS.about]: settings.about,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: Record<string, string> = {
        ...form,
        [SETTING_KEYS.deliveryFeeCents]: String(Math.round(parseFloat(form[SETTING_KEYS.deliveryFeeCents]) * 100)),
        [SETTING_KEYS.freeDeliveryThresholdCents]: String(Math.round(parseFloat(form[SETTING_KEYS.freeDeliveryThresholdCents]) * 100)),
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your bakery&rsquo;s store information and delivery settings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Store info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Store className="h-4 w-4 text-primary" />
              Store information
            </CardTitle>
            <CardDescription>Displayed in the footer and across the storefront.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="storeName">Store name</Label>
              <Input
                id="storeName"
                value={form[SETTING_KEYS.storeName]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.storeName]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form[SETTING_KEYS.tagline]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.tagline]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="about">About</Label>
              <Textarea
                id="about"
                rows={6}
                value={form[SETTING_KEYS.about]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.about]: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <MessageSquare className="h-4 w-4 text-primary" />
              Contact
            </CardTitle>
            <CardDescription>How customers can reach you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form[SETTING_KEYS.email]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.email]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form[SETTING_KEYS.phone]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.phone]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                rows={2}
                value={form[SETTING_KEYS.address]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.address]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={form[SETTING_KEYS.instagram]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.instagram]: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Clock className="h-4 w-4 text-primary" />
              Opening hours
            </CardTitle>
            <CardDescription>Shown in the footer and on the contact page.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="hoursWeekday">Weekday hours</Label>
              <Input
                id="hoursWeekday"
                value={form[SETTING_KEYS.hoursWeekday]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.hoursWeekday]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hoursWeekend">Weekend hours</Label>
              <Input
                id="hoursWeekend"
                value={form[SETTING_KEYS.hoursWeekend]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.hoursWeekend]: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="hoursClosed">Closed days</Label>
              <Input
                id="hoursClosed"
                value={form[SETTING_KEYS.hoursClosed]}
                onChange={(e) => setForm({ ...form, [SETTING_KEYS.hoursClosed]: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-serif text-lg">
              <Truck className="h-4 w-4 text-primary" />
              Delivery
            </CardTitle>
            <CardDescription>Configure delivery fees and free-shipping threshold.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="deliveryFee">Delivery fee (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={form[SETTING_KEYS.deliveryFeeCents]}
                  onChange={(e) => setForm({ ...form, [SETTING_KEYS.deliveryFeeCents]: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Charged per order below the free-delivery threshold.</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="threshold">Free delivery threshold (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  value={form[SETTING_KEYS.freeDeliveryThresholdCents]}
                  onChange={(e) => setForm({ ...form, [SETTING_KEYS.freeDeliveryThresholdCents]: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Orders above this amount get free delivery.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
