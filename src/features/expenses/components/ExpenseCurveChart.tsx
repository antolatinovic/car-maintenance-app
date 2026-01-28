/**
 * Expense cumulative curve chart with period selector
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, gradients, spacing, typography } from '@/core/theme';
import { GlassCard } from '@/shared/components/GlassCard';
import { CHART_COLORS } from '@/core/types/analytics';
import { useChartData, type ChartPeriod, type FinancialEntry } from '../hooks/useChartData';
import type { Expense, Document } from '@/core/types/database';

const PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: '1S', label: '1S' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '6M', label: '6M' },
  { key: '1A', label: '1A' },
  { key: 'ALL', label: 'Tout' },
];

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.screenPaddingHorizontal * 2 - spacing.cardPadding * 2 - 60;

function roundMaxValue(value: number): number {
  if (value <= 0) return 100;
  if (value <= 50) return Math.ceil(value / 10) * 10;
  if (value <= 500) return Math.ceil(value / 50) * 50;
  if (value <= 2000) return Math.ceil(value / 100) * 100;
  return Math.ceil(value / 500) * 500;
}

function formatAmount(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}k€` : `${k.toFixed(1)}k€`;
  }
  return `${Math.round(value)}€`;
}

interface ExpenseCurveChartProps {
  expenses: Expense[];
  documents?: Document[];
}

export const ExpenseCurveChart: React.FC<ExpenseCurveChartProps> = ({ expenses, documents = [] }) => {
  const [period, setPeriod] = useState<ChartPeriod>('1M');

  const financialEntries = useMemo<FinancialEntry[]>(() => {
    // Map expenses to financial entries
    const entries: FinancialEntry[] = expenses.map(e => ({ date: e.date, amount: e.amount }));

    // Collect document_ids already linked to an expense (to avoid double-counting)
    const linkedDocIds = new Set(
      expenses.map(e => e.document_id).filter((id): id is string => id != null),
    );

    // Add documents that have an amount and date and are not already linked to an expense
    for (const doc of documents) {
      if (doc.amount != null && doc.date != null && !linkedDocIds.has(doc.id)) {
        entries.push({ date: doc.date, amount: doc.amount });
      }
    }

    return entries;
  }, [expenses, documents]);

  const { chartData, periodTotal, periodLabel } = useChartData(financialEntries, period);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map(d => d.value));
    return roundMaxValue(max);
  }, [chartData]);

  const chartSpacing = useMemo(() => {
    if (chartData.length <= 1) return 0;
    return chartWidth / (chartData.length - 1);
  }, [chartData.length]);

  const formattedTotal = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(periodTotal);

  const renderPeriodPill = (item: { key: ChartPeriod; label: string }) => {
    const isSelected = period === item.key;

    if (isSelected) {
      return (
        <TouchableOpacity key={item.key} onPress={() => setPeriod(item.key)} activeOpacity={0.7}>
          <LinearGradient
            colors={gradients.violet}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pill}
          >
            <Text style={[styles.pillText, styles.pillTextSelected]}>{item.label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    const content = <Text style={styles.pillText}>{item.label}</Text>;

    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity key={item.key} onPress={() => setPeriod(item.key)} activeOpacity={0.7}>
          <View style={styles.pillGlassWrapper}>
            <BlurView intensity={15} tint="light" style={styles.pill}>
              {content}
            </BlurView>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity key={item.key} onPress={() => setPeriod(item.key)} activeOpacity={0.7}>
        <View style={[styles.pill, styles.pillAndroid]}>
          {content}
        </View>
      </TouchableOpacity>
    );
  };

  const hasEnoughData = chartData.length >= 2;

  return (
    <View style={styles.container}>
      <GlassCard variant="medium">
        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Évolution</Text>
              <Text style={styles.periodLabel}>{periodLabel}</Text>
            </View>
            <Text style={styles.totalAmount}>{formattedTotal}</Text>
          </View>

          {/* Period selector */}
          <View style={styles.periodSelector}>
            {PERIODS.map(renderPeriodPill)}
          </View>

          {/* Chart or empty state */}
          {hasEnoughData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={180}
                spacing={chartSpacing}
                initialSpacing={0}
                endSpacing={0}
                disableScroll
                color={CHART_COLORS.total}
                thickness={3}
                hideRules
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={styles.axisLabel}
                xAxisLabelTextStyle={styles.axisLabel}
                noOfSections={4}
                maxValue={maxValue}
                formatYLabel={(label: string) => formatAmount(Number(label))}
                curved
                areaChart
                startFillColor={`${CHART_COLORS.total}40`}
                endFillColor={`${CHART_COLORS.total}05`}
                startOpacity={0.4}
                endOpacity={0.05}
                hideDataPoints
                focusEnabled
                showStripOnFocus
                stripColor={`${CHART_COLORS.total}20`}
                stripWidth={2}
                showTextOnFocus
                focusedDataPointColor={CHART_COLORS.total}
                focusedDataPointRadius={6}
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Pas assez de données pour cette période
              </Text>
            </View>
          )}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
  },
  cardContent: {
    padding: spacing.cardPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  periodLabel: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  totalAmount: {
    ...typography.h2,
    color: CHART_COLORS.total,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  pill: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pillGlassWrapper: {
    borderRadius: spacing.buttonRadiusSmall,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  pillAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  pillText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.textOnColor,
  },
  chartContainer: {
    alignItems: 'center',
  },
  axisLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
