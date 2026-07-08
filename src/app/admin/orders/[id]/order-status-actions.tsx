'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_META } from '@/lib/format'
import { toast } from 'sonner'

type Props = {
  orderId: string
  currentStatus: string
  allowed: string[]
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'outline' | 'destructive' }> = {
  PROCESSING: { label: 'Start processing', icon: CheckCircle2, variant: 'default' },
  COMPLETED: { label: 'Mark completed', icon: CheckCircle2, variant: 'default' },
  CANCELLED: { label: 'Cancel order', icon: XCircle, variant: 'destructive' },
  REFUNDED: { label: 'Issue refund', icon: RefreshCcw, variant: 'destructive' },
}

export function OrderStatusActions({ orderId, currentStatus, allowed }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  const handleTransition = async (newStatus: string) => {
    if (!confirm(`Change order status to ${ORDER_STATUS_META[newStatus]?.label ?? newStatus}?`)) return
    setPending(newStatus)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Update failed' }))
        throw new Error(err.error ?? 'Update failed')
      }
      toast.success(`Order marked as ${ORDER_STATUS_META[newStatus]?.label ?? newStatus}`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Current status: <span className="font-medium text-foreground">{ORDER_STATUS_META[currentStatus]?.label ?? currentStatus}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {allowed.map((status) => {
          const action = ACTION_LABELS[status]
          if (!action) return null
          const Icon = action.icon
          return (
            <Button
              key={status}
              variant={action.variant}
              onClick={() => handleTransition(status)}
              disabled={pending !== null}
              className="gap-2"
            >
              {pending === status ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
