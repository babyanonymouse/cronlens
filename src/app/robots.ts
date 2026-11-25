import type { MetadataRoute } from 'next';
import { isPreviewDeployment, siteUrl } from './site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: isPreviewDeployment
      ? undefined
      : new URL('/sitemap.xml', siteUrl).toString(),
  };
}
