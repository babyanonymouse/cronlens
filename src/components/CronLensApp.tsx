'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CronFieldType, CronPreset } from '@/lib/cron/types';
import { CRON_FIELD_KEYS } from '@/lib/cron/constants';
import { validateCron } from '@/lib/cron/parser';
import { Header } from '@/components/Header';
import { PresetPills } from '@/components/PresetPills';
import { CronInputBar } from '@/components/CronInputBar';
import { HumanReadableSummary } from '@/components/HumanReadableSummary';
import { SegmentedFieldControls } from '@/components/SegmentedFieldControls';
import { NextExecutionsList } from '@/components/NextExecutionsList';
import { QuickCopyDropdown } from '@/components/QuickCopyDropdown';
import { CheatSheetModal } from '@/components/CheatSheetModal';
import { getHumanDescription } from '@/lib/cron/parser';

const DEFAULT_CRON = '*/15 9-17 * * 1-5';

export function CronLensApp(): React.JSX.Element {
  const [expression, setExpression] = useState<string>(DEFAULT_CRON);
  const [activeField, setActiveField] = useState<CronFieldType>('minute');
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);

  // Sync with URL query parameter ?cron=...
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const queryCron = params.get('cron');
      if (queryCron && queryCron.trim()) {
        setExpression(queryCron.trim());
      }
    };

    window.addEventListener('popstate', syncFromUrl);
    const timer = setTimeout(syncFromUrl, 0);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      clearTimeout(timer);
    };
  }, []);

  // Update URL query param when expression changes
  const updateUrlParam = useCallback((newExpr: string) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newExpr && newExpr !== DEFAULT_CRON) {
        url.searchParams.set('cron', newExpr);
      } else {
        url.searchParams.delete('cron');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const handleExpressionChange = (newVal: string): void => {
    setExpression(newVal);
    updateUrlParam(newVal);
  };

  const handlePresetSelect = (preset: CronPreset): void => {
    setExpression(preset.expression);
    updateUrlParam(preset.expression);
  };

  const handleReset = (): void => {
    setExpression(DEFAULT_CRON);
    updateUrlParam(DEFAULT_CRON);
  };

  // Update a single segmented field
  const handleUpdateField = (field: CronFieldType, newValue: string): void => {
    const trimmed = expression.trim();
    const rawParts = trimmed.split(/\s+/).filter(Boolean);
    const parts: [string, string, string, string, string] = [
      rawParts[0] || '*',
      rawParts[1] || '*',
      rawParts[2] || '*',
      rawParts[3] || '*',
      rawParts[4] || '*',
    ];

    const fieldIndex = CRON_FIELD_KEYS.indexOf(field);
    if (fieldIndex >= 0 && fieldIndex < 5) {
      parts[fieldIndex] = newValue.trim() || '*';
      const updatedExpr = parts.join(' ');
      setExpression(updatedExpr);
      updateUrlParam(updatedExpr);
    }
  };

  const validation = validateCron(expression);
  const human = getHumanDescription(expression);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenCheatSheet={() => setIsCheatSheetOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Core Feature 1: Bidirectional Cron Editor (Monospace Input + Segment Badges) */}
        <section aria-label="Cron Expression Input">
          <CronInputBar
            expression={expression}
            onChange={handleExpressionChange}
            validation={validation}
            activeField={activeField}
            onSelectField={setActiveField}
            onReset={handleReset}
          />
        </section>

        {/* Quick Presets Pills */}
        <section aria-label="Quick Presets">
          <PresetPills
            currentExpression={expression}
            onSelectPreset={handlePresetSelect}
          />
        </section>

        {/* Core Feature 2: Live Human-Readable Translation & Inline Errors */}
        <section aria-label="Human-Readable Schedule Translation">
          <HumanReadableSummary
            expression={expression}
            validation={validation}
            onSelectField={setActiveField}
          />
        </section>

        {/* Segmented Controls + Next 5 Executions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top: Segmented Field Controls (Core Feature 1 part B) */}
          <section className="lg:col-span-7" aria-label="Segmented Field Controls">
            <SegmentedFieldControls
              expression={expression}
              validation={validation}
              activeField={activeField}
              onSelectField={setActiveField}
              onUpdateField={handleUpdateField}
            />
          </section>

          {/* Right / Bottom: Next 5 Execution Timestamps (Core Feature 3) */}
          <section className="lg:col-span-5" aria-label="Upcoming Execution Timestamps">
            <NextExecutionsList expression={expression} />
          </section>
        </div>

        {/* Core Feature 4: One-Click Copy & Developer Export Actions */}
        <section aria-label="Export and Copy Actions">
          <QuickCopyDropdown
            expression={expression}
            description={human.description}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12 bg-card/40 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">CronLens</span>
            <span>—</span>
            <span>Developer-focused Cron Expression Builder & Debugger</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsCheatSheetOpen(true)}
              className="hover:text-foreground transition-colors underline cursor-pointer"
            >
              Syntax Guide
            </button>
            <span>•</span>
            <span>Compatible with standard POSIX crontab</span>
          </div>
        </div>
      </footer>

      {/* Cheat Sheet Modal */}
      <CheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        onSelectExample={(ex) => {
          setExpression(ex);
          updateUrlParam(ex);
        }}
      />
    </div>
  );
}
