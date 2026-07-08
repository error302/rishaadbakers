// Rishaad Bakers — Logo component
// Renders the configured logo image (from SiteSetting) with sensible defaults.
// Falls back to a Cake icon if the logo URL is empty.

import Image from 'next/image'
import { Cake } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogoProps = {
  src: string
  alt: string
  size?: number
  className?: string
  showWordmark?: boolean
  wordmark?: string
}

export function Logo({ src, alt, size = 40, className, showWordmark = false, wordmark }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      {src ? (
        <span
          className="relative shrink-0 overflow-hidden rounded-full"
          style={{ width: size, height: size }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={`${size}px`}
            className="object-cover"
            unoptimized
            priority
          />
        </span>
      ) : (
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          style={{ width: size, height: size }}
        >
          <Cake className="h-1/2 w-1/2" />
        </span>
      )}
      {showWordmark && wordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-base font-bold tracking-tight md:text-lg">{wordmark}</span>
        </span>
      )}
    </span>
  )
}
