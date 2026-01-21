/**
 * Monthly expenses bar chart with stacked categories
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { colors, spacing, typography } from '@/core/theme';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, type MonthlyExpenseData } from '@/core/types/analytics';

interface ExpenseTrendChartProps {
  data: MonthlyExpenseData[];
  selectedYear: number;
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.screenPaddingHorizontal * 2 - spacing.cardPadding * 2;

export const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data, selectedYear }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      stacks: [
        { value: item.fuel, color: CHART_COLORS.fuel },
        { value: item.maintenance, color: CHART_COLORS.maintenance },
        { value: item.other, color: CHART_COLORS.other },
      ],
      label: item.month,
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.total));
    return Math.ceil(max / 100) * 100 || 500;
  }, [data]);

  const totalYear = useMemo(() => {
    return data.reduce((sum, d) => sum + d.total, 0);
  }, [data]);

  const formatAmount = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <ChartCard
      title="Depenses mensuelles"
      subtitle={`Total ${selectedYear}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalYear)}`}
    >
      <View style={styles.chartContainer}>
        <BarChart
          stackData={chartData}
          width={chartWidth - 40}
          height={180}
          barWidth={16}
          spacing={12}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          noOfSections={4}
          maxValue={maxValue}
          formatYLabel={(label: string) => formatAmount(Number(label))}
          barBorderRadius={4}
          disablePress={false}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.fuel }]} />
          <Text style={styles.legendText}>Carburant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.maintenance }]} />
          <Text style={styles.legendText}>Entretien</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: CHART_COLORS.other }]} />
          <Text style={styles.legendText}>Autre</Text>
        </View>
      </View>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  axisLabel: {
    ...typography.small,
    color: colors.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.l,
    marginTop: spacing.s,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
