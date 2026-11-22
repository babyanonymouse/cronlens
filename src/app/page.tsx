import { Suspense } from 'react';
import { CronLensApp } from '@/components/CronLensApp';

export default function HomePage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground font-mono text-sm">
          Loading CronLens...
        </div>
      }
    >
      <CronLensApp />
    </Suspense>
  );
}
