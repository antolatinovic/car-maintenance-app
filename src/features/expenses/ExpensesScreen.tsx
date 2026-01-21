/**
 * Expenses screen - main entry point for expense management
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { getPrimaryVehicle } from '@/services/vehicleService';
import { useExpenses } from './hooks';
import { ExpensesHeader, ExpenseFilters, ExpenseList, ExpenseForm } from './components';
import type { Expense, ExpenseType } from '@/core/types/database';
import type { CreateExpenseData } from '@/services/expenseService';

interface ExpensesScreenProps {
  onAnalyticsPress?: () => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ onAnalyticsPress }) => {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ExpenseType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setVehicleLoading(true);
      const result = await getPrimaryVehicle();
      if (result.data) {
        setVehicleId(result.data.id);
      }
      setVehicleLoading(false);
    };
    fetchVehicle();
  }, []);

  const {
    expenses,
    isLoading,
    budgetSummary,
    refresh,
    addNewExpense,
    editExpense,
    removeExpense,
    filterByType,
    getMonthlyTotal,
  } = useExpenses(vehicleId);

  const filteredExpenses = useMemo(() => filterByType(selectedType), [filterByType, selectedType]);

  const handleAddPress = useCallback(() => {
    setSelectedExpense(null);
    setShowForm(true);
  }, []);

  const handleExpensePress = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  }, []);

  const handleExpenseLongPress = useCallback(
    (expense: Expense) => {
      Alert.alert('Supprimer la depense', 'Etes-vous sur de vouloir supprimer cette depense ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await removeExpense(expense.id);
          },
        },
      ]);
    },
    [removeExpense]
  );

  const handleFormSubmit = useCallback(
    async (data: Omit<CreateExpenseData, 'vehicle_id'>) => {
      let result;
      if (selectedExpense) {
        result = await editExpense(selectedExpense.id, data);
      } else {
        result = await addNewExpense(data);
      }

      if (result) {
        setShowForm(false);
        setSelectedExpense(null);
      }
    },
    [selectedExpense, addNewExpense, editExpense]
  );

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setSelectedExpense(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedType(null);
  }, []);

  if (vehicleLoading) {
    return (
      <View style={styles.container}>
        <ExpensesHeader monthlyTotal={0} onAddPress={() => {}} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </View>
    );
  }

  if (!vehicleId) {
    return (
      <View style={styles.container}>
        <ExpensesHeader monthlyTotal={0} onAddPress={() => {}} />
        <View style={styles.centerContent}>
          <View style={styles.noVehicleIcon}>
            <Ionicons name="car-outline" size={48} color={colors.textTertiary} />
          </View>
          <Text style={styles.noVehicleTitle}>Aucun vehicule</Text>
          <Text style={styles.noVehicleText}>
            Ajoutez un vehicule depuis l'ecran d'accueil pour gerer vos depenses
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpensesHeader
        monthlyTotal={getMonthlyTotal()}
        onAddPress={handleAddPress}
        onAnalyticsPress={onAnalyticsPress}
      />

      <ExpenseList
        expenses={filteredExpenses}
        isLoading={isLoading}
        hasFilters={selectedType !== null}
        onExpensePress={handleExpensePress}
        onExpenseLongPress={handleExpenseLongPress}
        onRefresh={refresh}
        onAddExpense={handleAddPress}
        onClearFilters={handleClearFilters}
        ListHeaderComponent={
          <ExpenseFilters selectedType={selectedType} onSelectType={setSelectedType} />
        }
      />

      <ExpenseForm
        visible={showForm}
        expense={selectedExpense}
        isLoading={isLoading}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  noVehicleIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  noVehicleTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  noVehicleText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
