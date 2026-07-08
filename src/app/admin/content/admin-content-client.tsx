'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, Save, RotateCcw, Eye, Upload, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  SETTING_KEYS,
  SETTING_GROUPS,
  FIELD_META,
  type SiteSettings,
  type FieldMeta,
} from '@/lib/settings'

type Props = { settings: SiteSettings }

// Convert SiteSettings → flat key/value map for the API
function settingsToValues(s: SiteSettings): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of Object.keys(SETTING_KEYS) as (keyof SiteSettings)[]) {
    const dbKey = SETTING_KEYS[k]
    const v = s[k]
    if (typeof v === 'boolean') out[dbKey] = v ? 'true' : 'false'
    else if (typeof v === 'number') out[dbKey] = String(v)
    else out[dbKey] = v
  }
  return out
}

export function AdminContentClient({ settings }: Props) {
  const [values, setValues] = useState<Record<string, string>>(settingsToValues(settings))
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(SETTING_GROUPS[0].label)

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setValues((prev) => ({ ...prev, [SETTING_KEYS[key]]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('All content saved — storefront updated')
    } catch {
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm('Reset all changes to their last-saved values?')) return
    setValues(settingsToValues(settings))
    toast.info('Reverted to last saved values')
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2 MB')
      return
    }
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      handleChange('logoUrl', url)
      toast.success('Logo uploaded — remember to click Save')
    } catch {
      toast.error('Logo upload failed')
    }
  }

  const renderField = (meta: FieldMeta) => {
    const key = SETTING_KEYS[meta.key]
    const value = values[key] ?? ''

    switch (meta.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">{meta.label}</p>
              {meta.help && <p className="text-xs text-muted-foreground">{meta.help}</p>}
            </div>
            <Switch
              checked={value === 'true'}
              onCheckedChange={(v) => handleChange(meta.key, v ? 'true' : 'false')}
            />
          </div>
        )

      case 'textarea':
        return (
          <div className="grid gap-1.5">
            <Label htmlFor={key}>{meta.label}</Label>
            <Textarea
              id={key}
              rows={5}
              value={value}
              onChange={(e) => handleChange(meta.key, e.target.value)}
              placeholder={meta.placeholder}
            />
            {meta.help && <p className="text-xs text-muted-foreground">{meta.help}</p>}
          </div>
        )

      case 'multiline-list':
        return (
          <div className="grid gap-1.5">
            <Label htmlFor={key}>{meta.label}</Label>
            <Textarea
              id={key}
              rows={8}
              value={value}
              onChange={(e) => handleChange(meta.key, e.target.value)}
              placeholder="One item per line"
              className="font-mono text-sm"
            />
            {meta.help && <p className="text-xs text-muted-foreground">{meta.help}</p>}
            <p className="text-xs text-muted-foreground">
              {value.split('\n').filter(Boolean).length} item(s)
            </p>
          </div>
        )

      case 'currency':
        return (
          <div className="grid gap-1.5">
            <Label htmlFor={key}>{meta.label}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id={key}
                type="number"
                step="0.01"
                className="pl-7"
                value={(parseFloat(value) / 100).toFixed(2)}
                onChange={(e) => handleChange(meta.key, String(Math.round(parseFloat(e.target.value) * 100)))}
              />
            </div>
            {meta.help && <p className="text-xs text-muted-foreground">{meta.help}</p>}
          </div>
        )

      default:
        return (
          <div className="grid gap-1.5">
            <Label htmlFor={key}>{meta.label}</Label>
            <Input
              id={key}
              value={value}
              onChange={(e) => handleChange(meta.key, e.target.value)}
              placeholder={meta.placeholder}
            />
            {meta.help && <p className="text-xs text-muted-foreground">{meta.help}</p>}
          </div>
        )
    }
  }

  // Special preview card for the Brand & Logo group
  const renderBrandPreview = () => {
    const logoUrl = values[SETTING_KEYS.logoUrl] ?? ''
    const storeName = values[SETTING_KEYS.storeName] ?? ''
    return (
      <Card className="overflow-hidden border-2 border-dashed border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-serif text-base">
            <Eye className="h-4 w-4" />
            Live logo preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl bg-background p-4">
            {logoUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border">
                <Image src={logoUrl} alt="Logo preview" fill sizes="64px" className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
            )}
            <div>
              <p className="font-serif text-lg font-bold">{storeName || 'Your bakery name'}</p>
              <p className="text-xs text-muted-foreground">This is how your logo appears in the header &amp; footer</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              <Upload className="h-4 w-4" />
              Upload logo file
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-muted-foreground">or paste a URL in the field below</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Content &amp; Wording</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit every word your customers see — homepage, about, school, contact, footer, logo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save all changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {SETTING_GROUPS.map((g) => (
            <TabsTrigger key={g.label} value={g.label} className="text-xs">
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SETTING_GROUPS.map((group) => (
          <TabsContent key={group.label} value={group.label} className="mt-4 space-y-4">
            {group.label === 'Brand & Logo' && renderBrandPreview()}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">{group.label}</CardTitle>
                {group.label === 'School / Baking Class' && (
                  <CardDescription>
                    Toggle the school on/off, edit the curriculum, pricing, and contact info shown on /school.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="grid gap-4">
                {group.keys.map((key) => {
                  const meta = FIELD_META.find((m) => m.key === key)
                  if (!meta) return null
                  return <div key={key}>{renderField(meta)}</div>
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Save footer (sticky) */}
      <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <p className="text-xs text-muted-foreground">
          Changes apply site-wide immediately after saving.
        </p>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save all changes
        </Button>
      </div>
    </div>
  )
}
