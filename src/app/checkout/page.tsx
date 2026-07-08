import { getSiteSettings } from '@/lib/settings'
import { CheckoutClient } from './checkout-client'

export default async function CheckoutPage() {
  const settings = await getSiteSettings()
  return <CheckoutClient settings={settings} />
}
