// Rishaad Bakers — storefront shell wrapper
// Each public page wraps its children in this to get the Header + Footer + sticky footer layout.

import { Header } from './header'
import { Footer } from './footer'
import { WhatsAppButton } from './whatsapp-button'
import { getSiteSettings, type SiteSettings } from '@/lib/settings'

export async function StorefrontShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        schoolEnabled={settings.schoolEnabled}
        whatsapp={settings.whatsapp}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton
        whatsapp={settings.whatsapp}
        phone={settings.phone}
        storeName={settings.storeName}
      />
    </div>
  )
}

// For client components that need settings (passed from server parent)
export function StorefrontShellClient({ children, settings }: { children: React.ReactNode; settings: SiteSettings }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
        schoolEnabled={settings.schoolEnabled}
        whatsapp={settings.whatsapp}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton
        whatsapp={settings.whatsapp}
        phone={settings.phone}
        storeName={settings.storeName}
      />
    </div>
  )
}
