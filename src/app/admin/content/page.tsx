import { AdminContentClient } from './admin-content-client'
import { getSiteSettings } from '@/lib/settings'

export default async function AdminContentPage() {
  const settings = await getSiteSettings()
  return <AdminContentClient settings={settings} />
}
