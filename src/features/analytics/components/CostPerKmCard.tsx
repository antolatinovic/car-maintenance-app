/**
 * Cost per kilometer statistics card
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography, shadows } from '@/core/theme';
import type { CostPerKmData } from '@/core/types/analytics';

interface CostPerKmCardProps {
  data: CostPerKmData;
}

export const CostPerKmCard: React.FC<CostPerKmCardProps> = ({ data }) => {
  const formattedValue = data.value.toFixed(2);
  const formattedExpenses = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(data.totalExpenses);
  const formattedKm = new Intl.NumberFormat('fr-FR').format(data.totalKm);

  const trendIcon =
    data.trend !== null
      ? data.trend > 0
        ? 'trending-up'
        : data.trend < 0
          ? 'trending-down'
          : 'remove'
      : null;

  const trendColor =
    data.trend !== null && data.trend > 0 ? colors.accentDanger : colors.accentSuccess;

  return (
    <LinearGradient
      colors={gradients.violet}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Cout par kilometre</Text>
        {data.trend !== null && trendIcon && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}30` }]}>
            <Ionicons name={trendIcon} size={14} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>{Math.abs(data.trend)}%</Text>
          </View>
        )}
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{formattedValue}</Text>
        <Text style={styles.unit}>EUR/km</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="wallet-outline" size={16} color={colors.textOnColor} />
          </View>
          <View>
            <Text style={styles.statLabel}>Depenses</Text>
            <Text style={styles.statValue}>{formattedExpenses}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <View style={styles.statIcon}>
            <Ionicons name="speedometer-outline" size={16} color={colors.textOnColor} />
          </View>
          <View>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{formattedKm} km</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPaddingLarge,
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.captionMedium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadiusSmall,
  },
  trendText: {
    ...typography.smallMedium,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  value: {
    ...typography.numberLarge,
    color: colors.textOnColor,
  },
  unit: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statValue: {
    ...typography.captionSemiBold,
    color: colors.textOnColor,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: spacing.m,
  },
});
