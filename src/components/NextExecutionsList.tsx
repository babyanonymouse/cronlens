'use client';

import React, { useState } from 'react';
import { getNextRuns } from '@/lib/cron/parser';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Globe, Copy, Check, RefreshCw } from 'lucide-react';

interface NextExecutionsListProps {
  expression: string;
}

const COMMON_TIMEZONES = [
  { label: 'Local Browser Timezone', value: '' },
  { label: 'UTC (Universal Coordinated Time)', value: 'UTC' },
  { label: 'New York (EDT/EST)', value: 'America/New_York' },
  { label: 'San Francisco (PDT/PST)', value: 'America/Los_Angeles' },
  { label: 'London (BST/GMT)', value: 'Europe/London' },
  { label: 'Berlin / Paris (CEST/CET)', value: 'Europe/Berlin' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
];

const subscribeNoop = (): (() => void) => () => {};
const getClientSnapshot = (): boolean => true;
const getServerSnapshot = (): boolean => false;

export function NextExecutionsList({ expression }: NextExecutionsListProps): React.JSX.Element {
  const [selectedTz, setSelectedTz] = useState<string>('');
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isClient = React.useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot
  );

  const result = isClient
    ? getNextRuns(expression, 5, selectedTz || undefined)
    : { success: false, runs: [], error: null };

  const handleCopyAll = async (): Promise<void> => {
    if (!result.success || result.runs.length === 0) return;
    const text = result.runs
      .map(
        (r) =>
          `Run #${r.index}: ${r.localString} (${r.utcString}) [${r.relativeString}]`
      )
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (e) {
      console.error('Failed to copy runs', e);
    }
  };

  const handleCopySingle = async (utcString: string, index: number): Promise<void> => {
    try {
      await navigator.clipboard.writeText(utcString);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error('Failed to copy run', e);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-primary/10 text-primary">
            <Calendar className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground">
              Next five execution times
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timezone Dropdown */}
          <div className="flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-lg border border-border text-xs">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedTz}
              onChange={(e) => setSelectedTz(e.target.value)}
              className="bg-transparent text-foreground text-xs font-medium focus:outline-none cursor-pointer"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value} className="bg-secondary text-foreground">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {result.success && result.runs.length > 0 && (
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary hover:bg-accent text-secondary-foreground transition-colors cursor-pointer"
              title="Copy all 5 timestamps"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3 h-3 text-success" />
                  <span className="text-success">Copied All</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy List</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Execution List Content */}
      {!isClient ? (
        <div className="p-6 rounded-xl bg-secondary/30 border border-dashed border-border text-center text-xs text-muted-foreground animate-pulse">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="font-medium text-foreground">Calculating next run timestamps…</p>
        </div>
      ) : !result.success ? (
        <div className="p-6 rounded-xl bg-secondary/30 border border-dashed border-border text-center text-xs text-muted-foreground">
          <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="font-medium text-foreground">No upcoming executions</p>
          <p className="mt-1">{result.error || 'Fix syntax errors to preview execution timestamps.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {result.runs.map((run) => (
            <div
              key={run.index}
              className={cn(
                'group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-colors duration-150 gap-2',
                run.index === 1
                  ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/10 shadow-xs'
                  : 'bg-secondary/30 border-border/60 hover:bg-secondary/60 hover:border-border'
              )}
            >
              {/* Left Column: Index & Time Info */}
              <div className="flex items-start sm:items-center gap-3">
                <span
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-lg text-xs font-mono font-bold shrink-0',
                    run.index === 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  #{run.index}
                </span>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {run.localString}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground border border-border">
                      Local
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>UTC: <code className="font-mono">{run.utcString}</code></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Relative Badge & Delta */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
                      run.index === 1
                        ? 'bg-success/15 text-success font-semibold'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {run.relativeString}
                  </span>

                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md border border-border">
                    {run.diffString}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopySingle(run.utcString, run.index)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                  title="Copy UTC timestamp"
                >
                  {copiedIndex === run.index ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Calculated dynamically in real-time
            </span>
            <span className="hidden sm:inline">
              Schedule repeats according to cron pattern
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
