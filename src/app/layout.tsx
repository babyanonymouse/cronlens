import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CronLens | Developer Cron Expression Builder & Human-Readable Debugger',
  description:
    'An interactive, bidirectional cron expression builder, live human-readable schedule translator, and next run timestamp previewer for developers.',
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
      </body>
    </html>
  );
}
