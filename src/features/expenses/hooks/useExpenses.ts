/**
 * Hook for managing expenses CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBudgetSummary,
  CreateExpenseData,
  BudgetSummary,
} from '@/services/expenseService';
import type { Expense, ExpenseType } from '@/core/types/database';

interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  budgetSummary: BudgetSummary | null;
}

interface UseExpensesReturn extends ExpensesState {
  refresh: () => Promise<void>;
  loadExpenses: (options?: { type?: ExpenseType }) => Promise<void>;
  addNewExpense: (data: Omit<CreateExpenseData, 'vehicle_id'>) => Promise<Expense | null>;
  editExpense: (expenseId: string, updates: Partial<CreateExpenseData>) => Promise<Expense | null>;
  removeExpense: (expenseId: string) => Promise<boolean>;
  filterByType: (type: ExpenseType | null) => Expense[];
  getMonthlyTotal: () => number;
}

export const useExpenses = (vehicleId: string | null): UseExpensesReturn => {
  const [state, setState] = useState<ExpensesState>({
    expenses: [],
    isLoading: false,
    error: null,
    budgetSummary: null,
  });

  const fetchExpenses = useCallback(
    async (options?: { type?: ExpenseType }) => {
      if (!vehicleId) {
        setState({ expenses: [], isLoading: false, error: null, budgetSummary: null });
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const [expensesResult, budgetResult] = await Promise.all([
          getExpenses(vehicleId, options),
          getBudgetSummary(vehicleId),
        ]);

        if (expensesResult.error) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: expensesResult.error?.message || 'Erreur inconnue',
          }));
          return;
        }

        setState({
          expenses: expensesResult.data || [],
          isLoading: false,
          error: null,
          budgetSummary: budgetResult.data,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors du chargement des depenses',
        }));
      }
    },
    [vehicleId]
  );

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const refresh = useCallback(async () => {
    await fetchExpenses();
  }, [fetchExpenses]);

  const loadExpenses = useCallback(
    async (options?: { type?: ExpenseType }) => {
      await fetchExpenses(options);
    },
    [fetchExpenses]
  );

  const addNewExpense = useCallback(
    async (data: Omit<CreateExpenseData, 'vehicle_id'>): Promise<Expense | null> => {
      if (!vehicleId) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await addExpense({
          ...data,
          vehicle_id: vehicleId,
        });

        if (result.error || !result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || "Erreur lors de l'ajout",
          }));
          return null;
        }

        // Refresh to get updated budget summary
        await fetchExpenses();

        return result.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Erreur lors de l'ajout de la depense",
        }));
        return null;
      }
    },
    [vehicleId, fetchExpenses]
  );

  const editExpense = useCallback(
    async (expenseId: string, updates: Partial<CreateExpenseData>): Promise<Expense | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await updateExpense(expenseId, updates);

        if (result.error || !result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || 'Erreur lors de la mise a jour',
          }));
          return null;
        }

        // Refresh to get updated budget summary
        await fetchExpenses();

        return result.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la modification',
        }));
        return null;
      }
    },
    [fetchExpenses]
  );

  const removeExpense = useCallback(
    async (expenseId: string): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await deleteExpense(expenseId);

        if (result.error) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || 'Erreur lors de la suppression',
          }));
          return false;
        }

        // Refresh to get updated budget summary
        await fetchExpenses();

        return true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la suppression',
        }));
        return false;
      }
    },
    [fetchExpenses]
  );

  const filterByType = useCallback(
    (type: ExpenseType | null): Expense[] => {
      if (!type) return state.expenses;
      return state.expenses.filter(expense => expense.type === type);
    },
    [state.expenses]
  );

  const getMonthlyTotal = useCallback((): number => {
    return state.budgetSummary?.total || 0;
  }, [state.budgetSummary]);

  return {
    ...state,
    refresh,
    loadExpenses,
    addNewExpense,
    editExpense,
    removeExpense,
    filterByType,
    getMonthlyTotal,
  };
};
