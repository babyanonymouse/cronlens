'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, Share2, Code2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickCopyDropdownProps {
  expression: string;
  description: string;
}

export function QuickCopyDropdown({
  expression,
  description,
}: QuickCopyDropdownProps): React.JSX.Element {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const getShareUrl = (): string => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('cron', expression);
    return url.toString();
  };

  const copyItems = [
    {
      key: 'cron',
      label: 'Copy Expression',
      sublabel: expression,
      text: expression,
      icon: Copy,
    },
    {
      key: 'crontab',
      label: 'Copy Crontab Entry',
      sublabel: `${expression} /path/to/command.sh >> /var/log/cron.log 2>&1`,
      text: `${expression} /path/to/command.sh >> /var/log/cron.log 2>&1`,
      icon: Terminal,
    },
    {
      key: 'description',
      label: 'Copy Plain English',
      sublabel: description,
      text: description,
      icon: FileText,
    },
    {
      key: 'share',
      label: 'Copy Shareable Link',
      sublabel: 'Permalink with ?cron query parameter',
      text: getShareUrl(),
      icon: Share2,
    },
    {
      key: 'js',
      label: 'Copy Node.js / Croner Snippet',
      sublabel: `new Cron('${expression}', () => { /* ... */ });`,
      text: `import { Cron } from 'croner';\n\nnew Cron('${expression}', () => {\n  console.log('Cron triggered: ${description}');\n});`,
      icon: Code2,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-primary/10 text-primary">
            <Copy className="w-4 h-4" />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Developer Export & Copy Actions
          </h2>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Instant 1-click clipboard formats
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {copyItems.map((item) => {
          const isCopied = copiedKey === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => copyToClipboard(item.text, item.key)}
              className={cn(
                'group flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer',
                isCopied
                  ? 'bg-success/10 border-success/40 ring-1 ring-success/20'
                  : 'bg-secondary/40 border-border/60 hover:bg-secondary hover:border-border'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg shrink-0 transition-colors',
                  isCopied
                    ? 'bg-success text-success-foreground'
                    : 'bg-card text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                )}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {item.label}
                  </span>
                  {isCopied && (
                    <span className="text-xs font-medium text-success animate-fade-in">
                      Copied!
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
