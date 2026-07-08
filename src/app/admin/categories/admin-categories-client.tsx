'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Plus, Trash2, Tags } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { categorySchema } from '@/lib/validations'

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  productCount: number
}

export function AdminCategoriesClient({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', imageUrl: '', sortOrder: 0 })
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', slug: '', description: '', imageUrl: '', sortOrder: categories.length + 1 })
    setOpen(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', imageUrl: c.imageUrl ?? '', sortOrder: c.sortOrder })
    setOpen(true)
  }

  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 }
      const parsed = categorySchema.safeParse(payload)
      if (!parsed.success) {
        toast.error(parsed.error.issues[0]?.message ?? 'Validation failed')
        return
      }
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }))
        throw new Error(err.error ?? 'Save failed')
      }
      toast.success(editing ? 'Category updated' : 'Category created')
      setOpen(false)
      // Refresh from server
      const fresh = await fetch('/api/admin/categories').then((r) => r.json())
      setCategories(fresh)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c: Category) => {
    if (c.productCount > 0) {
      toast.error(`Move ${c.productCount} products to another category first`)
      return
    }
    if (!confirm(`Delete "${c.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Delete failed' }))
        throw new Error(err.error ?? 'Delete failed')
      }
      setCategories((prev) => prev.filter((x) => x.id !== c.id))
      toast.success('Category deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Tags className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No categories yet</p>
            <p className="text-sm text-muted-foreground">Create your first category to start adding products.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              {c.imageUrl && (
                <div className="relative aspect-[5/3] w-full bg-muted">
                  <Image src={c.imageUrl} alt={c.name} fill sizes="300px" className="object-cover" unoptimized />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg font-semibold">{c.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                  <Badge variant="secondary">{c.productCount} items</Badge>
                </div>
                {c.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)} className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                    disabled={c.productCount > 0}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit category' : 'New category'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value
                  setForm((f) => ({ ...f, name: v, slug: editing ? f.slug : slugify(v) }))
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="sortOrder">Sort order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
