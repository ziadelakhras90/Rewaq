import type { MetadataRoute } from 'next'
import { getServerAppUrl } from '@/lib/utils/app-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getServerAppUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
