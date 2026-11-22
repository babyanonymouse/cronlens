import cronstrue from 'cronstrue';
import { Cron } from 'croner';
import { CRON_FIELDS, CRON_FIELD_KEYS } from './constants';
import { CronFieldType, CronValidationResult, NextRunItem } from './types';

/**
 * Validates a single cron segment according to its field rules.
 */
export function validateSegment(
  segment: string,
  fieldType: CronFieldType
): { isValid: boolean; error: string | null } {
  const meta = CRON_FIELDS[fieldType];
  const trimmed = segment.trim();

  if (!trimmed) {
    return { isValid: false, error: `${meta.label} field cannot be empty.` };
  }

  // Handle wildcard
  if (trimmed === '*') {
    return { isValid: true, error: null };
  }

  // Handle step with wildcard */N
  if (trimmed.startsWith('*/')) {
    const stepPart = trimmed.slice(2);
    const stepNum = Number(stepPart);
    if (!/^\d+$/.test(stepPart) || isNaN(stepNum) || stepNum <= 0) {
      return {
        isValid: false,
        error: `Invalid step for ${meta.label}: step must be a positive integer.`,
      };
    }
    const maxStep = meta.max - meta.min;
    if (stepNum > maxStep) {
      return {
        isValid: false,
        error: `Step ${stepNum} is too large for ${meta.label} (max interval is ${maxStep}).`,
      };
    }
    return { isValid: true, error: null };
  }

  // Handle comma-separated lists (e.g. 1,2,3 or 1-5,10)
  const listItems = trimmed.split(',');
  if (listItems.length > 1) {
    for (const item of listItems) {
      const subValidation = validateSegment(item, fieldType);
      if (!subValidation.isValid) {
        return subValidation;
      }
    }
    return { isValid: true, error: null };
  }

  // Single item check (may include range or range with step: 1-5 or 1-5/2)
  const item = listItems[0];

  // Helper to parse aliases or numbers
  const parseVal = (valStr: string): number | null => {
    const upper = valStr.toUpperCase();
    if (meta.allowedAliases && meta.allowedAliases[upper] !== undefined) {
      return meta.allowedAliases[upper];
    }
    if (/^\d+$/.test(valStr)) {
      return parseInt(valStr, 10);
    }
    return null;
  };

  // Check if it's a range (with optional step)
  if (item.includes('-')) {
    const [rangePart, stepPart] = item.split('/');
    const rangeBounds = rangePart.split('-');

    if (rangeBounds.length !== 2) {
      return { isValid: false, error: `Invalid range format '${item}' in ${meta.label}.` };
    }

    const start = parseVal(rangeBounds[0]);
    const end = parseVal(rangeBounds[1]);

    if (start === null || end === null) {
      return {
        isValid: false,
        error: `Invalid range bounds in '${item}'. Allowed values: ${meta.min}-${meta.max}.`,
      };
    }

    if (start < meta.min || start > meta.max || end < meta.min || end > meta.max) {
      return {
        isValid: false,
        error: `Range ${start}-${end} out of bounds for ${meta.label} (${meta.min}-${meta.max}).`,
      };
    }

    if (start > end) {
      return {
        isValid: false,
        error: `Inverted range: start (${start}) cannot be greater than end (${end}).`,
      };
    }

    if (stepPart !== undefined) {
      const stepNum = Number(stepPart);
      if (!/^\d+$/.test(stepPart) || isNaN(stepNum) || stepNum <= 0) {
        return { isValid: false, error: `Step in '${item}' must be a positive integer.` };
      }
      if (stepNum > end - start) {
        return {
          isValid: false,
          error: `Step ${stepNum} is greater than range span ${end - start}.`,
        };
      }
    }

    return { isValid: true, error: null };
  }

  // Check if it's a value/step (e.g. 5/10)
  if (item.includes('/')) {
    const [basePart, stepPart] = item.split('/');
    const base = parseVal(basePart);
    const stepNum = Number(stepPart);

    if (base === null || base < meta.min || base > meta.max) {
      return {
        isValid: false,
        error: `Base value in '${item}' is invalid for ${meta.label} (${meta.min}-${meta.max}).`,
      };
    }

    if (!/^\d+$/.test(stepPart) || isNaN(stepNum) || stepNum <= 0) {
      return { isValid: false, error: `Step in '${item}' must be a positive integer.` };
    }

    return { isValid: true, error: null };
  }

  // Simple single value
  const numVal = parseVal(item);
  if (numVal === null) {
    return {
      isValid: false,
      error: `Unrecognized token '${item}' for ${meta.label}. Valid values: ${meta.min}-${meta.max}${meta.aliasList ? ' or ' + meta.aliasList.slice(0, 3).join(', ') + '...' : ''}.`,
    };
  }

  if (numVal < meta.min || numVal > meta.max) {
    return {
      isValid: false,
      error: `Value ${numVal} out of range for ${meta.label} (must be between ${meta.min} and ${meta.max}).`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a complete 5-field cron expression.
 */
export function validateCron(expression: string): CronValidationResult {
  const trimmed = expression.trim();
  const rawParts = trimmed.split(/\s+/).filter(Boolean);

  const fieldErrors: Record<CronFieldType, string | null> = {
    minute: null,
    hour: null,
    dom: null,
    month: null,
    dow: null,
  };

  if (!trimmed) {
    return {
      isValid: false,
      rawExpression: expression,
      normalizedExpression: '',
      generalError: 'Cron expression cannot be empty.',
      fieldErrors,
      parts: ['', '', '', '', ''],
    };
  }

  if (rawParts.length !== 5) {
    const errorMsg =
      rawParts.length < 5
        ? `Incomplete cron expression: expected 5 fields (Minute Hour Day-of-Month Month Day-of-Week), but found only ${rawParts.length}.`
        : `Too many fields: standard crontab takes 5 fields, but found ${rawParts.length}.`;

    return {
      isValid: false,
      rawExpression: expression,
      normalizedExpression: rawParts.join(' '),
      generalError: errorMsg,
      fieldErrors,
      parts: [
        rawParts[0] || '',
        rawParts[1] || '',
        rawParts[2] || '',
        rawParts[3] || '',
        rawParts[4] || '',
      ],
    };
  }

  let hasErrors = false;
  let firstErrorMessage: string | null = null;

  for (let i = 0; i < 5; i++) {
    const fieldType = CRON_FIELD_KEYS[i];
    const segment = rawParts[i];
    const validation = validateSegment(segment, fieldType);

    if (!validation.isValid) {
      fieldErrors[fieldType] = validation.error;
      hasErrors = true;
      if (!firstErrorMessage) {
        firstErrorMessage = validation.error;
      }
    }
  }

  // Also test croner instantiation as an extra safety check
  const normalized = rawParts.join(' ');
  if (!hasErrors) {
    try {
      new Cron(normalized);
    } catch (e: unknown) {
      hasErrors = true;
      const err = e instanceof Error ? e.message : 'Invalid cron syntax';
      firstErrorMessage = err;
    }
  }

  return {
    isValid: !hasErrors,
    rawExpression: expression,
    normalizedExpression: normalized,
    generalError: firstErrorMessage,
    fieldErrors,
    parts: [rawParts[0], rawParts[1], rawParts[2], rawParts[3], rawParts[4]],
  };
}

/**
 * Returns human-readable description using cronstrue.
 */
export function getHumanDescription(expression: string): {
  success: boolean;
  description: string;
} {
  const trimmed = expression.trim();
  if (!trimmed) {
    return {
      success: false,
      description: 'Enter a valid 5-part cron expression to see the schedule explanation.',
    };
  }

  try {
    const text = cronstrue.toString(trimmed, {
      throwExceptionOnParseError: true,
      verbose: true,
      use24HourTimeFormat: false,
    });
    return {
      success: true,
      description: text,
    };
  } catch {
    return {
      success: false,
      description: 'Unable to parse schedule. Please check the syntax of your expression.',
    };
  }
}

/**
 * Formats a relative duration in plain English (e.g. "in 4 minutes").
 */
export function formatRelativeTime(targetDate: Date, now: Date = new Date()): string {
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) {
    return `in ${diffSec}s`;
  }
  if (diffMin < 60) {
    const remainingSec = diffSec % 60;
    return remainingSec > 0 ? `in ${diffMin}m ${remainingSec}s` : `in ${diffMin}m`;
  }
  if (diffHours < 24) {
    const remainingMin = diffMin % 60;
    return remainingMin > 0 ? `in ${diffHours}h ${remainingMin}m` : `in ${diffHours}h`;
  }
  const remainingHours = diffHours % 24;
  return remainingHours > 0 ? `in ${diffDays}d ${remainingHours}h` : `in ${diffDays}d`;
}

/**
 * Computes difference between two consecutive execution dates.
 */
export function formatDiffTime(prevDate: Date, currDate: Date): string {
  const diffMs = currDate.getTime() - prevDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 60) return `+${diffMin}m`;
  if (diffHours < 24) {
    const remMin = diffMin % 60;
    return remMin > 0 ? `+${diffHours}h ${remMin}m` : `+${diffHours}h`;
  }
  const remHours = diffHours % 24;
  return remHours > 0 ? `+${diffDays}d ${remHours}h` : `+${diffDays}d`;
}

/**
 * Returns the next N executions for a valid cron expression.
 */
export function getNextRuns(
  expression: string,
  count: number = 5,
  timezone?: string
): { success: boolean; runs: NextRunItem[]; error: string | null } {
  const trimmed = expression.trim();
  const validation = validateCron(trimmed);

  if (!validation.isValid) {
    return {
      success: false,
      runs: [],
      error: validation.generalError || 'Invalid cron expression',
    };
  }

  try {
    const cronJob = new Cron(validation.normalizedExpression, {
      timezone: timezone || undefined,
    });

    const dates = cronJob.nextRuns(count);
    if (!dates || dates.length === 0) {
      return {
        success: false,
        runs: [],
        error: 'No upcoming execution dates found for this expression.',
      };
    }

    const now = new Date();
    const runs: NextRunItem[] = dates.map((date, idx) => {
      // Local time formatting
      const localString = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      }).format(date);

      // UTC time formatting
      const utcString = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC',
        timeZoneName: 'short',
      }).format(date);

      const relativeString = formatRelativeTime(date, now);
      const diffString = idx === 0 ? 'Starting' : formatDiffTime(dates[idx - 1], date);

      return {
        index: idx + 1,
        date,
        utcString,
        localString,
        relativeString,
        diffString,
      };
    });

    return {
      success: true,
      runs,
      error: null,
    };
  } catch (err: unknown) {
    return {
      success: false,
      runs: [],
      error: err instanceof Error ? err.message : 'Error computing next runs',
    };
  }
}

/**
 * Explains an individual segment in natural language.
 */
export function explainSegment(segment: string, fieldType: CronFieldType): string {
  const meta = CRON_FIELDS[fieldType];
  const s = segment.trim();

  if (!s || s === '*') {
    return `Every ${meta.label.toLowerCase()}`;
  }

  if (s.startsWith('*/')) {
    const step = s.slice(2);
    return `Every ${step} ${meta.label.toLowerCase()}s`;
  }

  if (s.includes('-')) {
    const [range, step] = s.split('/');
    const [start, end] = range.split('-');
    let desc = `${meta.label} from ${start} through ${end}`;
    if (step) {
      desc += `, step ${step}`;
    }
    return desc;
  }

  if (s.includes(',')) {
    return `${meta.label}s: ${s.split(',').join(', ')}`;
  }

  if (fieldType === 'dow') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const num = parseInt(s, 10);
    if (!isNaN(num) && num >= 0 && num <= 7) {
      return `Only on ${days[num % 7]}`;
    }
  }

  if (fieldType === 'month') {
    const months = [
      '', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const num = parseInt(s, 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      return `Only in ${months[num]}`;
    }
  }

  return `At ${meta.label.toLowerCase()} ${s}`;
}
