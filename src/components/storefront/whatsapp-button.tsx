'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

type WhatsAppButtonProps = {
  whatsapp: string // international format e.g. 254724266695
  phone: string // display phone e.g. 0724 266 695
  storeName: string
  defaultText?: string
}

export function WhatsAppButton({ whatsapp, phone, storeName, defaultText }: WhatsAppButtonProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  // Hide on admin pages
  if (!mounted || pathname.startsWith('/admin')) return null
  if (!whatsapp) return null

  const message =
    defaultText ??
    `Hello ${storeName}! I'd like to know more about your cakes and baking class.`
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6"
      aria-live="polite"
    >
      {/* Expandable chat bubble */}
      {expanded && (
        <div className="mb-2 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-warm-lg">
          <div className="flex items-center justify-between bg-[#25D366] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold leading-tight">Chat with us</p>
                <p className="text-[10px] opacity-90">Typically replies within an hour</p>
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="rounded-full p-1 hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="mb-3 max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm">
              👋 Hi! Have a question about cakes, custom orders, or our baking class? Send us a WhatsApp message and we&rsquo;ll get right back to you.
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1da851] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Start WhatsApp chat
            </a>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Or call: <a href={`tel:${phone}`} className="font-medium text-foreground hover:underline">{phone}</a>
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-warm-lg transition-transform hover:scale-105 active:scale-95 md:h-16 md:w-16"
        aria-label={expanded ? 'Close WhatsApp chat' : 'Open WhatsApp chat'}
      >
        {/* Pulse ring */}
        {!expanded && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" aria-hidden="true" />
        )}
        {expanded ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />}
        {/* Notification dot when collapsed */}
        {!expanded && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
            1
          </span>
        )}
      </button>
    </div>
  )
}
