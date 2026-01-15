/**
 * Budget card component for expense display
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { Card } from '../../../shared/components/Card';

export type BudgetCategory = 'total' | 'fuel' | 'maintenance' | 'other';

interface BudgetCardProps {
  category: BudgetCategory;
  amount: number;
  trend?: number; // Percentage change
  onPress?: () => void;
}

const categoryConfig: Record<BudgetCategory, {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = {
  total: {
    label: 'Budget Total',
    icon: 'wallet-outline',
    color: colors.accentPrimary,
  },
  fuel: {
    label: 'Carburant',
    icon: 'water-outline',
    color: colors.accentWarning,
  },
  maintenance: {
    label: 'Entretien',
    icon: 'construct-outline',
    color: colors.accentSuccess,
  },
  other: {
    label: 'Autres',
    icon: 'ellipsis-horizontal-circle-outline',
    color: colors.textSecondary,
  },
};

export const BudgetCard: React.FC<BudgetCardProps> = ({
  category,
  amount,
  trend,
  onPress,
}) => {
  const config = categoryConfig[category];

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>

      <Text style={styles.label}>{config.label}</Text>
      <Text style={styles.amount}>{formatAmount(amount)}</Text>

      {trend !== undefined && (
        <View style={styles.trendContainer}>
          <Ionicons
            name={trend >= 0 ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={trend >= 0 ? colors.accentDanger : colors.accentSuccess}
          />
          <Text style={[
            styles.trendText,
            { color: trend >= 0 ? colors.accentDanger : colors.accentSuccess }
          ]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.m,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 2,
  },
  trendText: {
    ...typography.small,
    fontWeight: '500',
  },
});
