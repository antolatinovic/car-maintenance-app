/**
 * Budget cards grid component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { BudgetCard, BudgetCategory } from './BudgetCard';

interface BudgetData {
  category: BudgetCategory;
  amount: number;
  trend?: number;
}

interface BudgetGridProps {
  budgets: BudgetData[];
  onViewAllPress?: () => void;
  onBudgetPress?: (category: BudgetCategory) => void;
}

export const BudgetGrid: React.FC<BudgetGridProps> = ({
  budgets,
  onViewAllPress,
  onBudgetPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Investi</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAll}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.category}
            category={budget.category}
            amount={budget.amount}
            trend={budget.trend}
            onPress={() => onBudgetPress?.(budget.category)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  viewAll: {
    ...typography.caption,
    color: colors.accentPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.m,
  },
});
