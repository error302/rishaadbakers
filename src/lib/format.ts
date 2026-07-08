// Rishaad Bakers — currency & format helpers
// Money is stored as integer cents (per Backend Architect rule).

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) return formatDate(d)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

// Generate a sequential order number per Payments & Billing Engineer's
// "business-derived identifier" pattern: prefix + zero-padded counter.
export function generateOrderNumber(seq: number): string {
  return `RB-${1000 + seq}`
}

// Order status labels & colors
export const ORDER_STATUS_META: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  PROCESSING: {
    label: 'Processing',
    badge: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  REFUNDED: {
    label: 'Refunded',
    badge: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
  },
}

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

// Allowed status transitions (state machine)
export const ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

export function canTransition(from: string, to: string): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false
}
