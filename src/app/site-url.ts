const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const siteUrl = new URL(new URL(configuredSiteUrl).origin);

export const isPreviewDeployment =
  process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== 'production';
