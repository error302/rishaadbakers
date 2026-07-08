import { getSiteSettings } from '@/lib/settings'
import { CartPageClient } from './cart-page-client'

export default async function CartPage() {
  const settings = await getSiteSettings()
  return <CartPageClient settings={settings} />
}
