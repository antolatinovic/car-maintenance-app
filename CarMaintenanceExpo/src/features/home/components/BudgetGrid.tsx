/**
 * Budget cards horizontal scroll component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../../core/theme';
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
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAll}>Voir tout</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.accentPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {budgets.map(budget => (
          <BudgetCard
            key={budget.category}
            category={budget.category}
            amount={budget.amount}
            trend={budget.trend}
            onPress={() => onBudgetPress?.(budget.category)}
          />
        ))}
      </ScrollView>
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
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAll: {
    ...typography.link,
    color: colors.accentPrimary,
  },
  scrollContent: {
    paddingRight: spacing.screenPaddingHorizontal,
    gap: spacing.m,
  },
});
