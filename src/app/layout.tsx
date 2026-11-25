import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { isPreviewDeployment, siteUrl } from './site-url';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'CronLens — Cron Expression Builder & Schedule Translator',
    template: '%s | CronLens',
  },
  description:
    'Build, validate, and explain cron expressions with a live schedule preview, human-readable translations, upcoming run times, and one-click export.',
  applicationName: 'CronLens',
  category: 'developer tools',
  referrer: 'strict-origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: !isPreviewDeployment,
    follow: !isPreviewDeployment,
    googleBot: {
      index: !isPreviewDeployment,
      follow: !isPreviewDeployment,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'CronLens',
    title: 'CronLens — Cron Expression Builder & Schedule Translator',
    description:
      'Build, validate, and explain cron expressions with a live schedule preview, human-readable translations, upcoming run times, and one-click export.',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'CronLens cron expression builder and schedule translator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CronLens — Cron Expression Builder & Schedule Translator',
    description:
      'Build, validate, and explain cron expressions with a live schedule preview, human-readable translations, upcoming run times, and one-click export.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'CronLens',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#08111f',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
