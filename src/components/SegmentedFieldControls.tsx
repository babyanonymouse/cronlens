'use client';

import React, { useState } from 'react';
import { CRON_FIELDS, CRON_FIELD_KEYS, QUICK_SEGMENT_OPTIONS } from '@/lib/cron/constants';
import { CronFieldType, CronValidationResult } from '@/lib/cron/types';
import { cn } from '@/lib/utils';
import { Sliders, Check, AlertCircle } from 'lucide-react';

interface SegmentedFieldControlsProps {
  expression: string;
  validation: CronValidationResult;
  activeField: CronFieldType;
  onSelectField: (field: CronFieldType) => void;
  onUpdateField: (field: CronFieldType, newValue: string) => void;
}

type SegmentEditMode = 'quick' | 'step' | 'specific' | 'range' | 'custom';

export function SegmentedFieldControls({
  validation,
  activeField,
  onSelectField,
  onUpdateField,
}: SegmentedFieldControlsProps): React.JSX.Element {
  const meta = CRON_FIELDS[activeField];
  const currentValue = validation.parts[meta.index] || '*';
  const fieldError = validation.fieldErrors[activeField];

  const [editMode, setEditMode] = useState<SegmentEditMode>('quick');
  const [customInput, setCustomInput] = useState<string>(currentValue);

  // Parse current values into specific array for multi-select
  const parseSpecificValues = (val: string): number[] => {
    return val
      .split(',')
      .map((v) => parseInt(v.trim(), 10))
      .filter((n) => !isNaN(n));
  };

  const selectedNumbers = parseSpecificValues(currentValue);

  const toggleSpecificValue = (num: number): void => {
    let nextList: number[];
    if (selectedNumbers.includes(num)) {
      nextList = selectedNumbers.filter((n) => n !== num);
    } else {
      nextList = [...selectedNumbers, num].sort((a, b) => a - b);
    }

    if (nextList.length === 0) {
      onUpdateField(activeField, '*');
    } else {
      onUpdateField(activeField, nextList.join(','));
    }
  };

  const handleStepChange = (step: number): void => {
    if (step <= 1) {
      onUpdateField(activeField, '*');
    } else {
      onUpdateField(activeField, `*/${step}`);
    }
  };

  const handleRangeChange = (start: number, end: number): void => {
    if (start === meta.min && end === meta.max) {
      onUpdateField(activeField, '*');
    } else if (start <= end) {
      onUpdateField(activeField, `${start}-${end}`);
    }
  };

  // Range values helper
  let currentStart = meta.min;
  let currentEnd = meta.max;
  if (currentValue.includes('-')) {
    const [s, e] = currentValue.split('-');
    const parsedS = parseInt(s, 10);
    const parsedE = parseInt(e, 10);
    if (!isNaN(parsedS)) currentStart = parsedS;
    if (!isNaN(parsedE)) currentEnd = parsedE;
  }

  // Step value helper
  let currentStep = 1;
  if (currentValue.startsWith('*/')) {
    const s = parseInt(currentValue.slice(2), 10);
    if (!isNaN(s)) currentStep = s;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-primary/10 text-primary">
            <Sliders className="w-4 h-4" />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Segmented Field Controls
          </h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Modifying: <span className={cn('font-bold font-mono', meta.textClass)}>{meta.label}</span> ({meta.min} to {meta.max})
        </div>
      </div>

      {/* Field Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {CRON_FIELD_KEYS.map((key) => {
          const field = CRON_FIELDS[key];
          const isSelected = activeField === key;
          const val = validation.parts[field.index] || '*';
          const hasError = Boolean(validation.fieldErrors[key]);

          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelectField(key);
                setCustomInput(validation.parts[field.index] || '*');
              }}
              className={cn(
                'flex-1 min-w-[70px] sm:min-w-[100px] py-2 px-2.5 rounded-xl border text-center transition-all duration-150 cursor-pointer',
                isSelected
                  ? 'bg-accent border-primary ring-2 ring-primary/20 font-semibold'
                  : 'bg-secondary/40 border-border/60 hover:bg-secondary text-muted-foreground hover:text-foreground',
                hasError && 'border-destructive bg-destructive/10 text-destructive'
              )}
            >
              <div className="text-xs uppercase tracking-wider font-semibold opacity-80">
                {field.label}
              </div>
              <div className={cn('font-mono text-sm font-bold truncate mt-0.5', field.textClass)}>
                {val}
              </div>
            </button>
          );
        })}
      </div>

      {/* Inline Field Error Warning */}
      {fieldError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fieldError}</span>
        </div>
      )}

      {/* Sub-mode switcher for active field */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
        {(
          [
            { id: 'quick', label: 'Presets' },
            { id: 'specific', label: 'Select Specific' },
            { id: 'step', label: 'Interval (*/n)' },
            { id: 'range', label: 'Range (a-b)' },
            { id: 'custom', label: 'Raw String' },
          ] as const
        ).map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setEditMode(mode.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
              editMode === mode.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Active Sub-mode Content */}
      <div className="pt-1">
        {/* MODE: Quick presets */}
        {editMode === 'quick' && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Select a quick preset for {meta.label.toLowerCase()}:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {QUICK_SEGMENT_OPTIONS[activeField].map((option) => {
                const isSelected = currentValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onUpdateField(activeField, option.value)}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'border-border/60 bg-secondary/30 hover:bg-secondary text-foreground'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE: Select specific numbers / days */}
        {editMode === 'specific' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Click items to toggle inclusion in {meta.label.toLowerCase()}:</span>
              <button
                type="button"
                onClick={() => onUpdateField(activeField, '*')}
                className="underline hover:text-foreground cursor-pointer"
              >
                Reset to All (*)
              </button>
            </div>

            {/* If Day of Week, show day names */}
            {activeField === 'dow' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { num: 1, label: 'Mon', full: 'Monday' },
                  { num: 2, label: 'Tue', full: 'Tuesday' },
                  { num: 3, label: 'Wed', full: 'Wednesday' },
                  { num: 4, label: 'Thu', full: 'Thursday' },
                  { num: 5, label: 'Fri', full: 'Friday' },
                  { num: 6, label: 'Sat', full: 'Saturday' },
                  { num: 0, label: 'Sun', full: 'Sunday' },
                ].map((day) => {
                  const isSelected = selectedNumbers.includes(day.num);
                  return (
                    <button
                      key={day.num}
                      type="button"
                      onClick={() => toggleSpecificValue(day.num)}
                      className={cn(
                        'flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                          : 'border-border bg-secondary/40 hover:bg-secondary text-foreground'
                      )}
                    >
                      <span className="text-xs uppercase font-bold">{day.label}</span>
                      <span className="text-xs opacity-70 font-mono mt-0.5">{day.num}</span>
                    </button>
                  );
                })}
              </div>
            ) : activeField === 'month' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                ].map((monthName, idx) => {
                  const monthNum = idx + 1;
                  const isSelected = selectedNumbers.includes(monthNum);
                  return (
                    <button
                      key={monthName}
                      type="button"
                      onClick={() => toggleSpecificValue(monthNum)}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                          : 'border-border bg-secondary/40 hover:bg-secondary text-foreground'
                      )}
                    >
                      <span>{monthName}</span>
                      <span className="font-mono text-xs opacity-70">#{monthNum}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Minute / Hour / Day of Month grid */
              <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-56 overflow-y-auto p-1 border border-border/40 rounded-xl bg-secondary/20">
                {Array.from(
                  { length: meta.max - meta.min + 1 },
                  (_, i) => meta.min + i
                ).map((num) => {
                  const isSelected = selectedNumbers.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleSpecificValue(num)}
                      className={cn(
                        'py-1.5 rounded-lg font-mono text-xs font-medium transition-all text-center cursor-pointer border',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground font-bold shadow-xs'
                          : 'border-transparent bg-card/60 hover:bg-secondary hover:border-border text-foreground'
                      )}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODE: Step / Interval */}
        {editMode === 'step' && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Run every N {meta.label.toLowerCase()}s (syntax: <code className="font-mono font-bold text-foreground">*/N</code>):
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={Math.min(meta.max, 30)}
                value={currentStep}
                onChange={(e) => handleStepChange(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
              />
              <span className="font-mono font-bold text-lg text-primary px-3 py-1 bg-secondary rounded-lg border border-border min-w-16 text-center">
                {currentStep === 1 ? '*' : `*/${currentStep}`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[2, 3, 5, 10, 15, 20, 30]
                .filter((s) => s <= meta.max)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStepChange(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border',
                      currentStep === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-foreground border-border hover:bg-accent'
                    )}
                  >
                    Every {s} (*/{s})
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* MODE: Range */}
        {editMode === 'range' && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Execute within a continuous range between start and end (syntax: <code className="font-mono font-bold text-foreground">A-B</code>):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Start {meta.label}: <span className="font-mono font-bold text-primary">{currentStart}</span>
                </label>
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  value={currentStart}
                  onChange={(e) => {
                    const nextStart = parseInt(e.target.value, 10);
                    handleRangeChange(nextStart, Math.max(nextStart, currentEnd));
                  }}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  End {meta.label}: <span className="font-mono font-bold text-primary">{currentEnd}</span>
                </label>
                <input
                  type="range"
                  min={meta.min}
                  max={meta.max}
                  value={currentEnd}
                  onChange={(e) => {
                    const nextEnd = parseInt(e.target.value, 10);
                    handleRangeChange(Math.min(currentStart, nextEnd), nextEnd);
                  }}
                  className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Generated Range:</span>
              <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-secondary text-primary border border-border">
                {currentStart}-{currentEnd}
              </span>
            </div>
          </div>
        )}

        {/* MODE: Custom raw string */}
        {editMode === 'custom' && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Directly type a custom token for {meta.label.toLowerCase()} (e.g. <code className="font-mono">1,15,30</code> or <code className="font-mono">0-30/5</code>):
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  onUpdateField(activeField, e.target.value);
                }}
                placeholder={meta.placeholder}
                className="flex-1 bg-secondary rounded-xl px-3 py-2 font-mono text-sm font-bold text-foreground border border-input focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => {
                  setCustomInput('*');
                  onUpdateField(activeField, '*');
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                Reset to *
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
