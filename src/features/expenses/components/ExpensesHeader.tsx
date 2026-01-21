/**
 * Expenses screen header with title and add button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface ExpensesHeaderProps {
  monthlyTotal: number;
  onAddPress: () => void;
  onAnalyticsPress?: () => void;
}

export const ExpensesHeader: React.FC<ExpensesHeaderProps> = ({
  monthlyTotal,
  onAddPress,
  onAnalyticsPress,
}) => {
  const insets = useSafeAreaInsets();

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.m }]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Depenses</Text>
          <Text style={styles.subtitle}>{formatAmount(monthlyTotal)} ce mois</Text>
        </View>
        <View style={styles.actions}>
          {onAnalyticsPress && (
            <TouchableOpacity style={styles.analyticsButton} onPress={onAnalyticsPress}>
              <Ionicons name="bar-chart-outline" size={22} color={colors.accentPrimary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
            <Ionicons name="add" size={24} color={colors.textOnColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.accentPrimary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  analyticsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
