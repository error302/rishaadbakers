'use client'

import { useMemo, useState } from 'react'
import { Mail, Phone, Search, UserPlus, Trash2, MessageCircle, Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDateTime, relativeTime } from '@/lib/format'
import { toast } from 'sonner'

type Lead = {
  id: string
  name: string
  email: string
  phone: string
  programInterest: string
  preferredStart: string | null
  message: string | null
  status: string
  source: string
  createdAt: string
  updatedAt: string
}

const STATUS_META: Record<string, { label: string; badge: string; dot: string }> = {
  NEW: {
    label: 'New',
    badge: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  CONTACTED: {
    label: 'Contacted',
    badge: 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  ENROLLED: {
    label: 'Enrolled',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  LOST: {
    label: 'Lost',
    badge: 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
}

const STATUSES = ['NEW', 'CONTACTED', 'ENROLLED', 'LOST'] as const

export function AdminLeadsClient({ leads: initial }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initial)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !l.name.toLowerCase().includes(q) &&
          !l.email.toLowerCase().includes(q) &&
          !l.phone.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [leads, search, statusFilter])

  const counts = useMemo(
    () => ({
      total: leads.length,
      NEW: leads.filter((l) => l.status === 'NEW').length,
      CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
      ENROLLED: leads.filter((l) => l.status === 'ENROLLED').length,
      LOST: leads.filter((l) => l.status === 'LOST').length,
    }),
    [leads]
  )

  const handleStatusChange = async (lead: Lead, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)))
      setSelected((prev) => (prev?.id === lead.id ? { ...prev, status: newStatus } : prev))
      toast.success(`Lead marked as ${STATUS_META[newStatus]?.label ?? newStatus}`)
    } catch {
      toast.error('Failed to update lead status')
    }
  }

  const handleAddNote = async (lead: Lead) => {
    if (!notes.trim()) return
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() }),
      })
      if (!res.ok) throw new Error('Note failed')
      const updated = await fetch(`/api/admin/leads/${lead.id}`).then((r) => r.json()).catch(() => null)
      if (updated) {
        setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)))
        setSelected(updated)
      }
      setNotes('')
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    }
  }

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Delete enquiry from "${lead.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
      setSelected(null)
      toast.success('Lead deleted')
    } catch {
      toast.error('Failed to delete lead')
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold">Enrolment Leads</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {counts.total} total enquiries · {counts.NEW} new · {counts.CONTACTED} contacted · {counts.ENROLLED} enrolled
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses ({counts.total})</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label} ({counts[s]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No enrolment enquiries yet</p>
            <p className="text-sm text-muted-foreground">
              When visitors submit the form on the /school page, their enquiries will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Contact</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Program</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const meta = STATUS_META[l.status] ?? STATUS_META.NEW
                  return (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(l)}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {l.name}
                        </button>
                        <p className="text-xs text-muted-foreground md:hidden">{l.email}</p>
                        {l.preferredStart && (
                          <p className="hidden text-xs text-muted-foreground lg:block">
                            Prefers: {l.preferredStart}
                          </p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <p className="text-xs">{l.email}</p>
                        <p className="text-xs text-muted-foreground">{l.phone}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {l.programInterest}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground" title={formatDateTime(l.createdAt)}>
                        {relativeTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={l.status}
                          onValueChange={(v) => handleStatusChange(l, v)}
                        >
                          <SelectTrigger className="h-7 w-28 border-0 px-2 text-xs">
                            <span className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {STATUS_META[s].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(l)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              {/* Status + actions */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${STATUS_META[selected.status]?.badge} border`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${STATUS_META[selected.status]?.dot}`} />
                  {STATUS_META[selected.status]?.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Received {relativeTime(selected.createdAt)} · via {selected.source.replace('_', ' ')}
                </span>
              </div>

              {/* Contact info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="truncate text-sm font-medium">{selected.email}</p>
                  </div>
                </a>
                <a
                  href={`tel:${selected.phone}`}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selected.phone}</p>
                  </div>
                </a>
                {selected.preferredStart && (
                  <div className="flex items-start gap-3 rounded-lg border border-border p-3 sm:col-span-2">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Preferred start</p>
                      <p className="text-sm font-medium">{selected.preferredStart}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Program interest */}
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Program interest</p>
                <p className="font-medium">{selected.programInterest}</p>
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Enquiry message
                  </h3>
                  <div className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border p-4 text-sm">
                    {selected.message}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={selected.status === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selected, s)}
                    className="gap-1.5"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
                    {STATUS_META[s].label}
                  </Button>
                ))}
              </div>

              {/* Add note */}
              <div className="grid gap-1.5">
                <Label htmlFor="notes">Add admin note (appended to message)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Called on 2026-07-08, left voicemail. Will try again tomorrow."
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleAddNote(selected)} disabled={!notes.trim()}>
                    Add note
                  </Button>
                </div>
              </div>

              {/* Footer actions */}
              <DialogFooter className="flex-row items-center justify-between gap-2 border-t border-border pt-4 sm:justify-between">
                <Button variant="outline" size="sm" asChild className="gap-1.5">
                  <a
                    href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selected)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
