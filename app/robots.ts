import { MetadataRoute } from 'next';
import { CANONICAL_SITE_URL } from '@/lib/config/public';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${CANONICAL_SITE_URL}/sitemap.xml`,
  };
}
