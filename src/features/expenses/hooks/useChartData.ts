/**
 * Hook to transform financial entries into chart-ready cumulative curve data
 */

import { useMemo } from 'react';
import { MONTH_NAMES } from '@/core/types/analytics';

export interface FinancialEntry {
  date: string;
  amount: number;
}

export type ChartPeriod = '1S' | '1M' | '3M' | '6M' | '1A' | 'ALL';

/** French day-of-week labels indexed by JS getDay() (0=Sunday) */
const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

interface ChartPoint {
  value: number;
  label: string;
}

interface ChartDataResult {
  chartData: ChartPoint[];
  periodTotal: number;
  periodLabel: string;
}

/**
 * Parse "YYYY-MM-DD" as local midnight (not UTC).
 * new Date("2026-01-15") → UTC midnight → wrong day in some timezones.
 * This ensures consistency with bucket dates which are also local midnight.
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getDateRange(period: ChartPeriod, earliestExpenseDate?: Date): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case '1S':
      start.setDate(start.getDate() - 6);
      break;
    case '1M':
      start.setDate(1);
      break;
    case '3M':
      start.setMonth(start.getMonth() - 3);
      start.setDate(start.getDate() + 1);
      break;
    case '6M':
      start.setMonth(start.getMonth() - 6);
      start.setDate(start.getDate() + 1);
      break;
    case '1A':
      start.setFullYear(start.getFullYear() - 1);
      start.setDate(start.getDate() + 1);
      break;
    case 'ALL':
      if (earliestExpenseDate) {
        start.setTime(earliestExpenseDate.getTime());
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
      } else {
        start.setFullYear(start.getFullYear() - 1);
      }
      break;
  }

  return { start, end };
}

function getPeriodLabel(period: ChartPeriod): string {
  switch (period) {
    case '1S': return '7 derniers jours';
    case '1M': return 'Ce mois';
    case '3M': return '3 derniers mois';
    case '6M': return '6 derniers mois';
    case '1A': return '12 derniers mois';
    case 'ALL': return 'Toutes les dépenses';
  }
}

function generateBuckets(period: ChartPeriod, start: Date, end: Date): Date[] {
  const buckets: Date[] = [];

  switch (period) {
    case '1S': {
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        buckets.push(d);
      }
      break;
    }
    case '1M': {
      const current = new Date(start);
      while (current <= end) {
        buckets.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      break;
    }
    case '3M': {
      const current = new Date(start);
      while (current <= end) {
        buckets.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
      break;
    }
    case '6M': {
      const current = new Date(start);
      while (current <= end) {
        buckets.push(new Date(current));
        current.setDate(current.getDate() + 14);
      }
      break;
    }
    case '1A':
    case 'ALL': {
      const current = new Date(start);
      current.setDate(1);
      while (current <= end) {
        buckets.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
      break;
    }
  }

  return buckets;
}

function getBucketLabel(
  date: Date,
  index: number,
  totalBuckets: number,
  period: ChartPeriod,
): string {
  switch (period) {
    case '1S':
      return DAY_LABELS[date.getDay()];
    case '1M':
      if (index % 5 === 0 || index === totalBuckets - 1) {
        return `${date.getDate()}`;
      }
      return '';
    case '3M':
      if (index % 4 === 0) return MONTH_NAMES[date.getMonth()];
      return '';
    case '6M':
      if (index % 4 === 0) return MONTH_NAMES[date.getMonth()];
      return '';
    case '1A':
      return MONTH_NAMES[date.getMonth()];
    case 'ALL': {
      const step = totalBuckets <= 12 ? 3 : Math.ceil(totalBuckets / 5);
      if (index % step === 0 || index === totalBuckets - 1) {
        return `${MONTH_NAMES[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
      }
      return '';
    }
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function sumEntriesForBucket(
  entries: FinancialEntry[],
  bucketDate: Date,
  nextBucketDate: Date | null,
  period: ChartPeriod,
): number {
  return entries.reduce((sum, entry) => {
    const expDate = parseLocalDate(entry.date);

    if (period === '1S' || period === '1M') {
      if (isSameDay(expDate, bucketDate)) {
        return sum + Number(entry.amount);
      }
    } else if (period === '1A' || period === 'ALL') {
      if (isSameMonth(expDate, bucketDate)) {
        return sum + Number(entry.amount);
      }
    } else {
      // Week/bi-week: date falls in [bucketDate, nextBucketDate)
      if (nextBucketDate) {
        if (expDate >= bucketDate && expDate < nextBucketDate) {
          return sum + Number(entry.amount);
        }
      } else {
        if (expDate >= bucketDate) {
          return sum + Number(entry.amount);
        }
      }
    }

    return sum;
  }, 0);
}

export function useChartData(entries: FinancialEntry[], period: ChartPeriod): ChartDataResult {
  return useMemo(() => {
    // For ALL period, find earliest entry date
    let earliestDate: Date | undefined;
    if (period === 'ALL' && entries.length > 0) {
      earliestDate = entries.reduce((min, e) => {
        const d = parseLocalDate(e.date);
        return d < min ? d : min;
      }, parseLocalDate(entries[0].date));
    }

    const { start, end } = getDateRange(period, earliestDate);

    const filteredEntries = entries.filter(e => {
      const d = parseLocalDate(e.date);
      return d >= start && d <= end;
    });

    const buckets = generateBuckets(period, start, end);

    const bucketAmounts = buckets.map((bucketDate, i) => {
      const nextBucket = i < buckets.length - 1 ? buckets[i + 1] : null;
      return sumEntriesForBucket(filteredEntries, bucketDate, nextBucket, period);
    });

    let runningTotal = 0;
    const chartData: ChartPoint[] = bucketAmounts.map((amount, i) => {
      runningTotal += amount;
      return {
        value: runningTotal,
        label: getBucketLabel(buckets[i], i, buckets.length, period),
      };
    });

    const periodTotal = runningTotal;
    const periodLabel = getPeriodLabel(period);

    return { chartData, periodTotal, periodLabel };
  }, [entries, period]);
}
