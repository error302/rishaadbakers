// Rishaad Bakers — Zod validation schemas
// Per agency-agents Frontend Developer pattern (react-hook-form + zod).

import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priceCents: z.coerce.number().int().min(0, 'Price cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL').or(z.literal('')),
  galleryUrls: z.string().optional(),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  dietaryTags: z.string().optional(),
  ingredients: z.string().optional(),
  weightGrams: z.coerce.number().int().min(0).optional().or(z.literal(NaN)),
  servesPeople: z.coerce.number().int().min(0).optional().or(z.literal(NaN)),
})
export type ProductFormValues = z.infer<typeof productSchema>

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, hyphens only'),
  description: z.string().max(500).optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
})
export type CategoryFormValues = z.infer<typeof categorySchema>

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(7, 'Phone number is required'),
  deliveryAddress: z.string().min(10, 'Delivery address is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  deliveryTime: z.string().min(1, 'Delivery time is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
  allergyNotes: z.string().max(500).optional().or(z.literal('')),
})
export type CheckoutFormValues = z.infer<typeof checkoutSchema>

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginFormValues = z.infer<typeof loginSchema>
