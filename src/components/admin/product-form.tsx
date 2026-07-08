'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { productSchema, type ProductFormValues } from '@/lib/validations'
import { toast } from 'sonner'
import type { Category } from '@/lib/types'

type ProductFormProps = {
  categories: Category[]
  initialData?: {
    id: string
    name: string
    slug: string
    description: string
    priceCents: number
    categoryId: string
    imageUrl: string
    isAvailable: boolean
    isFeatured: boolean
    stock: number
    dietaryTags: string[]
    galleryUrls: string[]
    ingredients: string | null
    weightGrams: number | null
    servesPeople: number | null
  }
}

const DIETARY_PRESETS = ['vegetarian', 'vegan', 'gluten-free', 'nut-free', 'dairy-free', 'kosher', 'halal']

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!initialData
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dietaryTags, setDietaryTags] = useState<string[]>(initialData?.dietaryTags ?? [])
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.galleryUrls ?? [])
  const [newGalleryUrl, setNewGalleryUrl] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          priceCents: initialData.priceCents,
          categoryId: initialData.categoryId,
          imageUrl: initialData.imageUrl,
          isAvailable: initialData.isAvailable,
          isFeatured: initialData.isFeatured,
          stock: initialData.stock,
          dietaryTags: dietaryTags.join(','),
          ingredients: initialData.ingredients ?? '',
          weightGrams: initialData.weightGrams ?? 0,
          servesPeople: initialData.servesPeople ?? 0,
        }
      : {
          name: '',
          slug: '',
          description: '',
          priceCents: 0,
          categoryId: categories[0]?.id ?? '',
          imageUrl: '',
          isAvailable: true,
          isFeatured: false,
          stock: 0,
          dietaryTags: '',
          ingredients: '',
          weightGrams: 0,
          servesPeople: 0,
        },
  })

  const watchedCategoryId = watch('categoryId')
  const watchedImageUrl = watch('imageUrl')
  const watchedIsAvailable = watch('isAvailable')
  const watchedIsFeatured = watch('isFeatured')

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        dietaryTags: dietaryTags.join(','),
        galleryUrls: JSON.stringify(galleryUrls),
      }
      const url = isEdit ? `/api/admin/products/${initialData!.id}` : '/api/admin/products'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Save failed' }))
        throw new Error(err.error ?? 'Save failed')
      }
      const { id } = await res.json()
      toast.success(isEdit ? 'Product updated' : 'Product created')
      router.push('/admin/products')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit) return
    if (!confirm(`Delete "${initialData!.name}"? Order history is preserved but the product will be hidden.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${initialData!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Product deleted')
      router.push('/admin/products')
      router.refresh()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-9 w-9">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="font-serif text-2xl font-bold">
              {isEdit ? 'Edit product' : 'New product'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEdit ? initialData!.name : 'Add a new item to your bakery menu'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 text-destructive hover:text-destructive"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          )}
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>

      {/* Tabs per Filament Optimization Specialist pattern (tabs over flat >8 fields) */}
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3 md:w-fit">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
          <TabsTrigger value="media">Media & Tags</TabsTrigger>
        </TabsList>

        {/* Tab 1: Details */}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg">Product details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register('name', {
                      onChange: (e) => {
                        if (!isEdit) setValue('slug', slugify(e.target.value))
                      },
                    })}
                    placeholder="Vanilla Bean Layer Cake"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" {...register('slug')} placeholder="vanilla-bean-layer-cake" />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={5}
                  {...register('description')}
                  placeholder="Describe the cake, its flavour profile, and what makes it special..."
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={watchedCategoryId}
                    onValueChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pick a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="weightGrams">Weight (grams)</Label>
                  <Input id="weightGrams" type="number" {...register('weightGrams')} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="servesPeople">Serves (people)</Label>
                  <Input id="servesPeople" type="number" {...register('servesPeople')} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ingredients">Ingredients</Label>
                <Textarea
                  id="ingredients"
                  rows={2}
                  {...register('ingredients')}
                  placeholder="Comma-separated list of key ingredients"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Pricing & Inventory */}
        <TabsContent value="pricing" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="priceCents">Price (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="priceCents"
                      type="number"
                      step="0.01"
                      className="pl-7"
                      {...register('priceCents', {
                        setValueAs: (v) => Math.round(parseFloat(v) * 100),
                      })}
                      defaultValue={initialData ? (initialData.priceCents / 100).toFixed(2) : '0.00'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stored as cents to avoid floating-point errors.
                  </p>
                  {errors.priceCents && <p className="text-xs text-destructive">{errors.priceCents.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">Inventory & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="stock">Stock quantity</Label>
                  <Input id="stock" type="number" {...register('stock')} />
                  {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Available for purchase</p>
                    <p className="text-xs text-muted-foreground">Hide from storefront if off</p>
                  </div>
                  <Switch
                    checked={watchedIsAvailable}
                    onCheckedChange={(v) => setValue('isAvailable', v)}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch
                    checked={watchedIsFeatured}
                    onCheckedChange={(v) => setValue('isFeatured', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Media & Tags */}
        <TabsContent value="media" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">Main image</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
                </div>
                {watchedImageUrl && (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
                    <img src={watchedImageUrl} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-lg">Gallery & dietary tags</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label>Gallery images (additional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste an image URL..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newGalleryUrl.trim()) {
                          setGalleryUrls([...galleryUrls, newGalleryUrl.trim()])
                          setNewGalleryUrl('')
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {galleryUrls.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {galleryUrls.map((url, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-md border border-border p-1.5">
                          <img src={url} alt="" className="h-8 w-8 rounded object-cover" />
                          <span className="flex-1 truncate text-xs text-muted-foreground">{url}</span>
                          <button
                            type="button"
                            onClick={() => setGalleryUrls(galleryUrls.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid gap-1.5">
                  <Label>Dietary tags</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_PRESETS.map((tag) => {
                      const active = dietaryTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setDietaryTags(
                              active ? dietaryTags.filter((t) => t !== tag) : [...dietaryTags, tag]
                            )
                          }}
                          className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  {dietaryTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dietaryTags.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                          <button
                            type="button"
                            onClick={() => setDietaryTags(dietaryTags.filter((x) => x !== t))}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
