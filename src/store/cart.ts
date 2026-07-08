// Rishaad Bakers — cart store (Zustand + persist to localStorage)
// Per Rapid Prototyper agent pattern (zustand for client state).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  slug: string
  name: string
  imageUrl: string
  priceCents: number
  quantity: number
  maxStock: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  setOpen: (open: boolean) => void
  // selectors
  itemCount: () => number
  subtotalCents: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const items = [...get().items]
        const idx = items.findIndex((i) => i.productId === item.productId)
        if (idx >= 0) {
          const nextQty = Math.min(items[idx].quantity + quantity, item.maxStock || 99)
          items[idx] = { ...items[idx], quantity: nextQty }
        } else {
          items.push({ ...item, quantity: Math.min(quantity, item.maxStock || 99) })
        }
        set({ items, isOpen: true })
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        const items = get().items.map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || 99)) }
            : i
        )
        set({ items })
      },

      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    }),
    { name: 'rishaad-cart' }
  )
)
