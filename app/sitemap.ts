import { MetadataRoute } from 'next';
import { CANONICAL_SITE_URL } from '@/lib/config/public';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/vip',
    '/oracle',
    '/command-center',
    '/token',
    '/roadmap',
    '/whitepaper',
    '/credits',
    '/contact',
    '/features',
    '/faq',
    '/holdings',
    '/privacy',
    '/settings',
  ];

  return routes.map((route) => ({
    url: `${CANONICAL_SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
