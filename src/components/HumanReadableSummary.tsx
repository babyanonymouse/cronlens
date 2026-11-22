'use client';

import React, { useState } from 'react';
import { CronFieldType, CronValidationResult } from '@/lib/cron/types';
import { CRON_FIELDS, CRON_FIELD_KEYS } from '@/lib/cron/constants';
import { explainSegment, getHumanDescription } from '@/lib/cron/parser';
import { cn } from '@/lib/utils';
import { AlertTriangle, Copy, Check, Info, Sparkles } from 'lucide-react';

interface HumanReadableSummaryProps {
  expression: string;
  validation: CronValidationResult;
  onSelectField: (field: CronFieldType) => void;
}

export function HumanReadableSummary({
  expression,
  validation,
  onSelectField,
}: HumanReadableSummaryProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const human = getHumanDescription(expression);

  const handleCopyDescription = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(human.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy description', e);
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Human Explanation Card */}
      <div
        className={cn(
          'relative rounded-2xl border p-4 sm:p-5 transition-all duration-200',
          validation.isValid
            ? 'bg-card border-border shadow-xs'
            : 'bg-destructive/10 border-destructive/40 shadow-xs'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Human-Readable Translation
            </h2>
          </div>

          {validation.isValid && (
            <button
              type="button"
              onClick={handleCopyDescription}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors self-start sm:self-auto cursor-pointer"
              title="Copy English translation"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-success" />
                  <span className="text-success font-medium">Copied Translation</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Translation</span>
                </>
              )}
            </button>
          )}
        </div>

        {validation.isValid ? (
          <p className="text-lg sm:text-xl font-medium text-foreground leading-snug">
            &ldquo;{human.description}&rdquo;
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 text-destructive">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  Syntax Validation Error
                </p>
                <p className="text-xs sm:text-sm text-foreground/80 mt-0.5">
                  {validation.generalError || 'The cron expression contains one or more syntax errors.'}
                </p>
              </div>
            </div>

            {/* List all specific field errors */}
            <div className="mt-2 space-y-1 pl-7">
              {CRON_FIELD_KEYS.map((key) => {
                const err = validation.fieldErrors[key];
                if (!err) return null;
                const meta = CRON_FIELDS[key];
                return (
                  <div key={key} className="text-xs text-destructive flex items-center gap-1.5">
                    <span className="font-semibold">• {meta.label}:</span>
                    <span>{err}</span>
                    <button
                      type="button"
                      onClick={() => onSelectField(key)}
                      className="underline hover:text-destructive/80 font-medium ml-1 cursor-pointer"
                    >
                      Fix {meta.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed segment-by-segment chips */}
        {validation.isValid && (
          <div className="mt-4 pt-3 border-t border-border/60">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Info className="w-3.5 h-3.5" />
              <span>Segment Breakdown:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {CRON_FIELD_KEYS.map((key, idx) => {
                const meta = CRON_FIELDS[key];
                const segmentVal = validation.parts[idx] || '*';
                const explanation = explainSegment(segmentVal, key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectField(key)}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/60 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className={cn('font-mono text-xs font-bold', meta.textClass)}>
                        {segmentVal}
                      </span>
                    </div>
                    <span className="text-xs text-foreground/85 line-clamp-2">
                      {explanation}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
