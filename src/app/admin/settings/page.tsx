// The old "Settings" page is now part of the unified "Content & Wording" page.
// Redirect users there.
import { redirect } from 'next/navigation'

export default function AdminSettingsPage() {
  redirect('/admin/content')
}
