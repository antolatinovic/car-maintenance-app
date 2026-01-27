/**
 * Budget summary cards - Horizontal scrollable gradient cards
 * Uses the shared BudgetCard component to avoid duplication.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';
import { BudgetCard } from '@/shared/components';
import type { BudgetCategory } from '@/shared/components';
import type { BudgetSummary } from '@/services/expenseService';

interface BudgetSummaryCardsProps {
  budgetSummary: BudgetSummary | null;
  onSeeAll?: () => void;
}

const categories: BudgetCategory[] = ['total', 'fuel', 'maintenance', 'other'];

const categoryKeys: Record<BudgetCategory, { amountKey: keyof BudgetSummary; trendKey: keyof BudgetSummary }> = {
  total: { amountKey: 'total', trendKey: 'totalTrend' },
  fuel: { amountKey: 'fuel', trendKey: 'fuelTrend' },
  maintenance: { amountKey: 'maintenance', trendKey: 'maintenanceTrend' },
  other: { amountKey: 'other', trendKey: 'otherTrend' },
};

export const BudgetSummaryCards: React.FC<BudgetSummaryCardsProps> = ({
  budgetSummary,
  onSeeAll,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Budget du mois</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map(category => {
          const keys = categoryKeys[category];
          const amount = (budgetSummary?.[keys.amountKey] as number) ?? 0;
          const trend = budgetSummary?.[keys.trendKey] as number | undefined;

          return (
            <BudgetCard
              key={category}
              category={category}
              amount={amount}
              trend={trend}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.s,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.captionMedium,
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    gap: spacing.m,
  },
});
