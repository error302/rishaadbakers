'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, MoreVertical, Search, Trash2, Package, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import type { Category, Product } from '@/lib/types'

type Props = {
  products: Product[]
  categories: Category[]
}

export function AdminProductsClient({ products, categories }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [localProducts, setLocalProducts] = useState(products)

  const filtered = useMemo(() => {
    return localProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false
      if (availabilityFilter === 'in-stock' && (p.stock === 0 || !p.isAvailable)) return false
      if (availabilityFilter === 'low-stock' && (p.stock === 0 || p.stock > 5 || !p.isAvailable)) return false
      if (availabilityFilter === 'out-of-stock' && p.stock > 0 && p.isAvailable) return false
      if (availabilityFilter === 'unavailable' && p.isAvailable) return false
      return true
    })
  }, [localProducts, search, categoryFilter, availabilityFilter])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will hide it from the storefront. Order history is preserved.`)) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setLocalProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success(`"${name}" deleted`)
    } catch {
      toast.error('Failed to delete product')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="in-stock">In stock</SelectItem>
              <SelectItem value="low-stock">Low stock (≤5)</SelectItem>
              <SelectItem value="out-of-stock">Out of stock</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">Try adjusting filters or add a new product.</p>
            <Button asChild className="mt-2 gap-2">
              <Link href="/admin/products/new">
                Add product
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-center font-medium">Stock</th>
                  <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const lowStock = p.stock > 0 && p.stock <= 5
                  const outOfStock = p.stock === 0 || !p.isAvailable
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image src={p.imageUrl} alt={p.name} fill sizes="48px" className="object-cover" unoptimized />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="block truncate font-medium hover:text-primary"
                            >
                              {p.name}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-muted-foreground">{p.categoryName}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPrice(p.priceCents)}</td>
                      <td className="px-4 py-3 text-center">
                        {outOfStock ? (
                          <Badge variant="destructive" className="text-xs">0</Badge>
                        ) : lowStock ? (
                          <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">{p.stock}</Badge>
                        ) : (
                          <span className="font-medium">{p.stock}</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-center sm:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {p.isFeatured && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                          )}
                          {!p.isAvailable && (
                            <Badge variant="outline" className="text-xs">Hidden</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/product/${p.slug}`} target="_blank">
                                <Eye className="mr-2 h-4 w-4" /> View on store
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${p.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(p.id, p.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
