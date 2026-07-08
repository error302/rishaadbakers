// Rishaad Bakers — robots.txt
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/api/auth', '/api/checkout', '/api/leads', '/cart', '/checkout', '/order-confirmation'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
