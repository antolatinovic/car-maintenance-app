/**
 * Category breakdown donut chart
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { ChartCard } from './ChartCard';
import type { CategoryBreakdown } from '@/core/types/analytics';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  total: number;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fuel: 'water',
  maintenance: 'build',
  other: 'ellipsis-horizontal',
};

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Carburant',
  maintenance: 'Entretien',
  other: 'Autre',
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, total }) => {
  const pieData = data.map(item => ({
    value: item.amount,
    color: item.color,
    focused: item.category === 'fuel',
  }));

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCenterLabel = () => (
    <View style={styles.centerLabel}>
      <Text style={styles.centerAmount}>{formatAmount(total)}</Text>
      <Text style={styles.centerSubtitle}>Total</Text>
    </View>
  );

  if (data.length === 0) {
    return (
      <ChartCard title="Repartition par categorie">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas de donnees</Text>
        </View>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Repartition par categorie">
      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          donut
          radius={80}
          innerRadius={55}
          centerLabelComponent={renderCenterLabel}
          focusOnPress
          sectionAutoFocus
        />
      </View>

      <View style={styles.legendContainer}>
        {data.map(item => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name={CATEGORY_ICONS[item.category]} size={16} color={item.color} />
            </View>
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>{CATEGORY_LABELS[item.category]}</Text>
              <Text style={styles.legendAmount}>{formatAmount(item.amount)}</Text>
            </View>
            <Text style={styles.legendPercentage}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAmount: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  centerSubtitle: {
    ...typography.small,
    color: colors.textTertiary,
  },
  legendContainer: {
    width: '100%',
    gap: spacing.m,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  legendIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContent: {
    flex: 1,
  },
  legendLabel: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  legendAmount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  legendPercentage: {
    ...typography.captionSemiBold,
    color: colors.textPrimary,
  },
  emptyContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
});
