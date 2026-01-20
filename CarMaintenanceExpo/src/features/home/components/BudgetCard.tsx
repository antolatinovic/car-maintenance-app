/**
 * Budget card component - Colorful gradient style
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadows, spacing, typography, GradientKey } from '@/core/theme';

export type BudgetCategory = 'total' | 'fuel' | 'maintenance' | 'other';

interface BudgetCardProps {
  category: BudgetCategory;
  amount: number;
  trend?: number;
  onPress?: () => void;
}

const categoryConfig: Record<
  BudgetCategory,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradient: GradientKey;
  }
> = {
  total: {
    label: 'Total',
    icon: 'wallet',
    gradient: 'violet',
  },
  fuel: {
    label: 'Carburant',
    icon: 'water',
    gradient: 'blue',
  },
  maintenance: {
    label: 'Entretien',
    icon: 'construct',
    gradient: 'teal',
  },
  other: {
    label: 'Autres',
    icon: 'apps',
    gradient: 'pink',
  },
};

export const BudgetCard: React.FC<BudgetCardProps> = ({ category, amount, trend, onPress }) => {
  const config = categoryConfig[category];
  const gradientColors = gradients[config.gradient];

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={config.icon} size={24} color="rgba(255,255,255,0.9)" />
        </View>

        <Text style={styles.label}>{config.label}</Text>
        <Text style={styles.amount}>{formatAmount(amount)}</Text>

        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    height: 160,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.captionMedium,
    color: 'rgba(255,255,255,0.8)',
  },
  amount: {
    ...typography.h3,
    color: colors.textOnColor,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
