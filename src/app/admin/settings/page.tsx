import { AdminSettingsClient } from './admin-settings-client'
import { getSiteSettings } from '@/lib/settings'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()
  return <AdminSettingsClient settings={settings} />
}
