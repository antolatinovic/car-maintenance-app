/**
 * Mileage evolution line chart
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { colors, spacing, typography } from '@/core/theme';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, type MileagePoint } from '@/core/types/analytics';

interface MileageLineChartProps {
  data: MileagePoint[];
}

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.screenPaddingHorizontal * 2 - spacing.cardPadding * 2;

export const MileageLineChart: React.FC<MileageLineChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Take last 10 points for better visualization
    const recentData = data.slice(-10);

    return recentData.map((point, index) => ({
      value: point.mileage,
      label: index === 0 || index === recentData.length - 1 ? point.label : '',
      dataPointText: '',
    }));
  }, [data]);

  const { minValue, maxValue, difference } = useMemo(() => {
    if (data.length === 0) return { minValue: 0, maxValue: 10000, difference: 0 };

    const values = data.map(d => d.mileage);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const diff = max - min;

    return {
      minValue: Math.floor(min / 1000) * 1000,
      maxValue: Math.ceil(max / 1000) * 1000,
      difference: diff,
    };
  }, [data]);

  const formatMileage = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  if (data.length < 2) {
    return (
      <ChartCard title="Evolution du kilometrage">
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Pas assez de donnees. Ajoutez le kilometrage lors de vos depenses.
          </Text>
        </View>
      </ChartCard>
    );
  }

  const firstMileage = data[0]?.mileage || 0;
  const lastMileage = data[data.length - 1]?.mileage || 0;

  return (
    <ChartCard
      title="Evolution du kilometrage"
      subtitle={`+${new Intl.NumberFormat('fr-FR').format(difference)} km parcourus`}
    >
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={chartWidth - 60}
          height={150}
          color={CHART_COLORS.total}
          thickness={3}
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          noOfSections={4}
          maxValue={maxValue}
          yAxisOffset={minValue}
          formatYLabel={(label: string) => formatMileage(Number(label))}
          curved
          areaChart
          startFillColor={`${CHART_COLORS.total}40`}
          endFillColor={`${CHART_COLORS.total}05`}
          startOpacity={0.4}
          endOpacity={0.05}
          hideDataPoints={false}
          dataPointsColor={CHART_COLORS.total}
          dataPointsRadius={4}
          focusEnabled
          showStripOnFocus
          showTextOnFocus
          stripColor={`${CHART_COLORS.total}20`}
          stripWidth={2}
        />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Debut</Text>
          <Text style={styles.summaryValue}>
            {new Intl.NumberFormat('fr-FR').format(firstMileage)} km
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Actuel</Text>
          <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>
            {new Intl.NumberFormat('fr-FR').format(lastMileage)} km
          </Text>
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
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.small,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  summaryValueHighlight: {
    color: CHART_COLORS.total,
  },
});
