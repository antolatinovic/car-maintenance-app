/**
 * Expense Service - Operations for tracking expenses and budgets
 */

import { supabase } from '@/core/config/supabase';
import type { Expense, ExpenseType } from '@/core/types/database';

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

export interface CreateExpenseData {
  vehicle_id: string;
  type: ExpenseType;
  date: string;
  amount: number;
  mileage?: number;
  description?: string;
  document_id?: string;
}

export interface BudgetSummary {
  total: number;
  fuel: number;
  maintenance: number;
  other: number;
  totalTrend?: number;
  fuelTrend?: number;
  maintenanceTrend?: number;
  otherTrend?: number;
}

/**
 * Get expenses for a vehicle
 */
export const getExpenses = async (
  vehicleId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    type?: ExpenseType;
    limit?: number;
  }
): Promise<ServiceResult<Expense[]>> => {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false });

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }
    if (options?.type) {
      query = query.eq('type', options.type);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Expense[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des depenses' } };
  }
};

/**
 * Get budget summary for a vehicle (current month vs previous month)
 */
export const getBudgetSummary = async (
  vehicleId: string
): Promise<ServiceResult<BudgetSummary>> => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split('T')[0];
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split('T')[0];

    // Get current month expenses
    const { data: currentExpenses, error: currentError } = await supabase
      .from('expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('date', currentMonthStart)
      .lte('date', currentMonthEnd);

    if (currentError) {
      return { data: null, error: { message: currentError.message, code: currentError.code } };
    }

    // Get previous month expenses
    const { data: previousExpenses, error: previousError } = await supabase
      .from('expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('date', previousMonthStart)
      .lte('date', previousMonthEnd);

    if (previousError) {
      return { data: null, error: { message: previousError.message, code: previousError.code } };
    }

    // Calculate current month totals
    const current = calculateTotals(currentExpenses as Expense[]);
    const previous = calculateTotals(previousExpenses as Expense[]);

    // Calculate trends (percentage change)
    const calculateTrend = (current: number, previous: number): number | undefined => {
      if (previous === 0) return current > 0 ? 100 : undefined;
      return Math.round(((current - previous) / previous) * 100);
    };

    const summary: BudgetSummary = {
      total: current.total,
      fuel: current.fuel,
      maintenance: current.maintenance,
      other: current.other,
      totalTrend: calculateTrend(current.total, previous.total),
      fuelTrend: calculateTrend(current.fuel, previous.fuel),
      maintenanceTrend: calculateTrend(current.maintenance, previous.maintenance),
      otherTrend: calculateTrend(current.other, previous.other),
    };

    return { data: summary, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors du calcul du budget' } };
  }
};

/**
 * Helper to calculate totals by category
 */
const calculateTotals = (
  expenses: Expense[]
): { total: number; fuel: number; maintenance: number; other: number } => {
  return expenses.reduce(
    (acc, expense) => {
      acc.total += expense.amount;

      if (expense.type === 'fuel') {
        acc.fuel += expense.amount;
      } else if (expense.type === 'maintenance') {
        acc.maintenance += expense.amount;
      } else {
        acc.other += expense.amount;
      }

      return acc;
    },
    { total: 0, fuel: 0, maintenance: 0, other: 0 }
  );
};

/**
 * Add an expense
 */
export const addExpense = async (
  expenseData: CreateExpenseData
): Promise<ServiceResult<Expense>> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Expense, error: null };
  } catch (error) {
    return { data: null, error: { message: "Erreur lors de l'ajout de la depense" } };
  }
};

/**
 * Update an expense
 */
export const updateExpense = async (
  expenseId: string,
  updates: Partial<CreateExpenseData>
): Promise<ServiceResult<Expense>> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates as never)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Expense, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour' } };
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId: string): Promise<ServiceResult<boolean>> => {
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression' } };
  }
};

/**
 * Get yearly summary for charts/reports
 */
export const getYearlySummary = async (
  vehicleId: string,
  year?: number
): Promise<
  ServiceResult<{ month: string; total: number; fuel: number; maintenance: number }[]>
> => {
  try {
    const targetYear = year || new Date().getFullYear();
    const startDate = `${targetYear}-01-01`;
    const endDate = `${targetYear}-12-31`;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    // Group by month
    const monthlyData: Record<string, { total: number; fuel: number; maintenance: number }> = {};

    const monthNames = [
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
    ];

    // Initialize all months
    monthNames.forEach(month => {
      monthlyData[month] = { total: 0, fuel: 0, maintenance: 0 };
    });

    // Aggregate expenses
    (data as Expense[]).forEach(expense => {
      const monthIndex = new Date(expense.date).getMonth();
      const month = monthNames[monthIndex];

      monthlyData[month].total += expense.amount;
      if (expense.type === 'fuel') {
        monthlyData[month].fuel += expense.amount;
      } else if (expense.type === 'maintenance') {
        monthlyData[month].maintenance += expense.amount;
      }
    });

    const result = monthNames.map(month => ({
      month,
      ...monthlyData[month],
    }));

    return { data: result, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors du calcul annuel' } };
  }
};
