'use client';

import React from 'react';
import { CRON_PRESETS } from '@/lib/cron/constants';
import { CronPreset } from '@/lib/cron/types';
import { cn } from '@/lib/utils';
import { Zap, Clock } from 'lucide-react';

interface PresetPillsProps {
  currentExpression: string;
  onSelectPreset: (preset: CronPreset) => void;
}

export function PresetPills({
  currentExpression,
  onSelectPreset,
}: PresetPillsProps): React.JSX.Element {
  const normalizedCurrent = currentExpression.trim().replace(/\s+/g, ' ');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-warning" />
          Quick Presets
        </label>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Click any preset to load instantly
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {CRON_PRESETS.map((preset) => {
          const isActive = normalizedCurrent === preset.expression;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={cn(
                'group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-semibold'
                  : 'bg-card text-foreground border-border hover:bg-secondary hover:border-muted-foreground/30'
              )}
              title={`${preset.label}: ${preset.expression} (${preset.description})`}
            >
              <Clock
                className={cn(
                  'w-3 h-3 transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span>{preset.label}</span>
              <span
                className={cn(
                  'font-mono text-xs px-1.5 py-0.2 rounded transition-colors',
                  isActive
                    ? 'bg-primary-foreground/10 text-primary-foreground'
                    : 'bg-muted text-muted-foreground group-hover:text-foreground'
                )}
              >
                {preset.expression}
              </span>
              {preset.badge && !isActive && (
                <span className="hidden sm:inline-flex px-1.5 py-0.2 text-xs rounded-full bg-warning/15 text-warning font-semibold">
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
