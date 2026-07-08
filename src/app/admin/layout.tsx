import { getAuthSession } from '@/lib/auth'
import { getSiteSettings } from '@/lib/settings'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Auth is enforced by middleware (src/middleware.ts) for all /admin/* routes
  // except /admin/login. The session is also re-checked here for rendering context.
  const [session, settings] = await Promise.all([getAuthSession(), getSiteSettings()])

  // On the login page, render children directly without the admin shell.
  // The login page renders its own full-screen layout.
  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      <AdminSidebar
        user={session.user}
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
        logoAlt={settings.logoAlt}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          user={session.user}
          storeName={settings.storeName}
          logoUrl={settings.logoUrl}
          logoAlt={settings.logoAlt}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
