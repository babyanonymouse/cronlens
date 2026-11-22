export type CronFieldType = 'minute' | 'hour' | 'dom' | 'month' | 'dow';

export interface CronFieldMeta {
  id: CronFieldType;
  index: number;
  label: string;
  shortLabel: string;
  min: number;
  max: number;
  allowedAliases?: Record<string, number>;
  aliasList?: string[];
  placeholder: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeBg: string;
}

export interface CronValidationResult {
  isValid: boolean;
  rawExpression: string;
  normalizedExpression: string;
  generalError: string | null;
  fieldErrors: Record<CronFieldType, string | null>;
  parts: [string, string, string, string, string];
}

export interface CronPreset {
  id: string;
  label: string;
  expression: string;
  description: string;
  badge?: string;
  category: 'common' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface NextRunItem {
  index: number;
  date: Date;
  utcString: string;
  localString: string;
  relativeString: string;
  diffString: string;
}

export interface SegmentQuickOption {
  label: string;
  value: string;
  description?: string;
}
