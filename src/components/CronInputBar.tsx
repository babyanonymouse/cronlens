'use client';

import React, { useState } from 'react';
import { CRON_FIELDS, CRON_FIELD_KEYS } from '@/lib/cron/constants';
import { CronFieldType, CronValidationResult } from '@/lib/cron/types';
import { cn } from '@/lib/utils';
import { Copy, Check, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CronInputBarProps {
  expression: string;
  onChange: (value: string) => void;
  validation: CronValidationResult;
  activeField: CronFieldType | null;
  onSelectField: (field: CronFieldType) => void;
  onReset: () => void;
}

export function CronInputBar({
  expression,
  onChange,
  validation,
  activeField,
  onSelectField,
  onReset,
}: CronInputBarProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy to clipboard', e);
    }
  };

  const parts = validation.parts;

  return (
    <div className="space-y-3">
      {/* Main Input Card */}
      <div
        className={cn(
          'relative rounded-2xl border transition-all duration-200 bg-card p-4 sm:p-5 shadow-sm',
          validation.isValid
            ? 'border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20'
            : 'border-destructive/60 bg-destructive/5 focus-within:border-destructive focus-within:ring-2 focus-within:ring-destructive/20'
        )}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cron Expression
            </span>
            {validation.isValid ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/15 text-success">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive">
                <AlertCircle className="w-3 h-3" /> Invalid Syntax
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Reset to default expression"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs',
                copied
                  ? 'bg-success text-success-foreground'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
              )}
              title="Copy cron expression to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-scale-in" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Cron</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monospace Interactive Text Box */}
        <div className="relative">
          <input
            type="text"
            value={expression}
            onChange={(e) => onChange(e.target.value)}
            placeholder="* * * * *"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="w-full bg-secondary/60 rounded-xl px-4 py-3 sm:py-3.5 font-mono text-xl sm:text-2xl font-bold tracking-wider text-foreground placeholder:text-muted-foreground/40 border border-input focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Segmented token inspector badges */}
        <div className="mt-3 pt-3 border-t border-border/60">
          <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
            <span>5-Segment Field Breakdown:</span>
            <span className="hidden sm:inline text-xs opacity-75">Click a segment to jump to its editor</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {CRON_FIELD_KEYS.map((key, index) => {
              const meta = CRON_FIELDS[key];
              const value = parts[index] || '-';
              const isSelected = activeField === key;
              const hasError = Boolean(validation.fieldErrors[key]);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectField(key)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-accent'
                      : 'border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border',
                    hasError && 'border-destructive bg-destructive/10'
                  )}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {meta.shortLabel}
                  </span>
                  <span
                    className={cn(
                      'font-mono font-bold text-sm sm:text-base truncate max-w-full px-1',
                      hasError ? 'text-destructive' : meta.textClass
                    )}
                  >
                    {value}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block truncate">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
