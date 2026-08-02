import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://darkempire.holdings';

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
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
