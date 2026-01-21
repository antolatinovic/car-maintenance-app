/**
 * Analytics types for charts and data visualization
 */

export interface MonthlyExpenseData {
  month: string;
  total: number;
  fuel: number;
  maintenance: number;
  other: number;
}

export interface CategoryBreakdown {
  category: 'fuel' | 'maintenance' | 'other';
  amount: number;
  percentage: number;
  color: string;
}

export interface MileagePoint {
  date: string;
  mileage: number;
  label: string;
}

export interface CostPerKmData {
  value: number;
  trend: number | null;
  totalExpenses: number;
  totalKm: number;
}

export interface AnalyticsData {
  yearlySummary: MonthlyExpenseData[];
  categoryBreakdown: CategoryBreakdown[];
  mileageHistory: MileagePoint[];
  costPerKm: CostPerKmData;
  yearTotal: number;
}

export const CHART_COLORS = {
  fuel: '#3B82F6',
  maintenance: '#14B8A6',
  other: '#EC4899',
  total: '#7C3AED',
} as const;

export const MONTH_NAMES = [
  'Jan',
  'Fev',
  'Mar',
  'Avr',
  'Mai',
  'Jun',
  'Jul',
  'Aou',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
