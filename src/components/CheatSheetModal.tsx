'use client';

import React, { useEffect } from 'react';
import { X, BookOpen, Terminal, Sparkles } from 'lucide-react';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (cron: string) => void;
}

export function CheatSheetModal({
  isOpen,
  onClose,
  onSelectExample,
}: CheatSheetModalProps): React.JSX.Element | null {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-2xl text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Cron Syntax Cheat Sheet</h3>
              <p className="text-xs text-muted-foreground">
                Standard Linux / Unix Crontab Reference Guide
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-5 text-sm">
          {/* Format Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              Standard 5-Field Position Format
            </h4>
            <div className="p-3 rounded-xl bg-secondary font-mono text-xs overflow-x-auto border border-border">
              <div className="text-muted-foreground mb-1">
                ┌───────────── minute (0 - 59)
                <br />│ ┌────────────── hour (0 - 23)
                <br />│ │ ┌─────────────── day of month (1 - 31)
                <br />│ │ │ ┌──────────────── month (1 - 12)
                <br />│ │ │ │ ┌───────────────── day of week (0 - 7, 0 or 7 is Sun)
                <br />* * * * *
              </div>
            </div>
          </div>

          {/* Special Characters */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Special Characters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                <span className="font-mono font-bold text-primary text-sm">* (Wildcard)</span>
                <p className="text-muted-foreground mt-0.5">
                  Matches every possible value in that field. (e.g. * in hour = every hour)
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                <span className="font-mono font-bold text-primary text-sm">, (List)</span>
                <p className="text-muted-foreground mt-0.5">
                  Separates items in a discrete set. (e.g. 1,15,30 in minute)
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                <span className="font-mono font-bold text-primary text-sm">- (Range)</span>
                <p className="text-muted-foreground mt-0.5">
                  Specifies an inclusive range of numbers. (e.g. 9-17 in hour)
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                <span className="font-mono font-bold text-primary text-sm">/ (Step)</span>
                <p className="text-muted-foreground mt-0.5">
                  Specifies value intervals or increments. (e.g. */15 in minute)
                </p>
              </div>
            </div>
          </div>

          {/* Common Useful Patterns */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              Common Production Patterns (Click to Load)
            </h4>
            <div className="space-y-1.5">
              {[
                { cron: '*/5 * * * *', label: 'Every 5 minutes', note: 'Frequent polling / queues' },
                { cron: '0 * * * *', label: 'Hourly on the hour', note: 'Data sync / cache refreshes' },
                { cron: '0 0 * * *', label: 'Daily at midnight', note: 'Log rotation / daily rollups' },
                { cron: '0 9 * * 1-5', label: 'Weekdays at 9 AM', note: 'Business notifications' },
                { cron: '0 0 * * 0', label: 'Every Sunday at midnight', note: 'Weekly maintenance' },
                { cron: '0 0 1 * *', label: '1st of every month', note: 'Monthly invoices / billing' },
                { cron: '0 9,17 * * 1-5', label: 'Twice daily on workdays', note: 'Morning and evening reports' },
              ].map((ex) => (
                <button
                  key={ex.cron}
                  type="button"
                  onClick={() => {
                    onSelectExample(ex.cron);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/60 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {ex.cron}
                    </span>
                    <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors">
                      {ex.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {ex.note}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
