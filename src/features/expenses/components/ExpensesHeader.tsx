/**
 * Expenses screen header with title, gradient add button and blur analytics button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '@/core/theme';

interface ExpensesHeaderProps {
  monthlyTotal: number;
  expenseCount?: number;
  onAddPress: () => void;
  onAnalyticsPress?: () => void;
}

export const ExpensesHeader: React.FC<ExpensesHeaderProps> = ({
  monthlyTotal,
  expenseCount,
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
          {expenseCount !== undefined && expenseCount > 0 && (
            <Text style={styles.countText}>{expenseCount} depense{expenseCount > 1 ? 's' : ''}</Text>
          )}
        </View>
        <View style={styles.actions}>
          {onAnalyticsPress && (
            <TouchableOpacity
              style={styles.analyticsButton}
              onPress={onAnalyticsPress}
              activeOpacity={0.7}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={25} tint="light" style={styles.analyticsBlur}>
                  <Ionicons name="bar-chart-outline" size={22} color={colors.accentPrimary} />
                </BlurView>
              ) : (
                <View style={styles.analyticsAndroid}>
                  <Ionicons name="bar-chart-outline" size={22} color={colors.accentPrimary} />
                </View>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.addButton} onPress={onAddPress} activeOpacity={0.8}>
            <LinearGradient
              colors={gradients.violet}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color={colors.textOnColor} />
            </LinearGradient>
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
  countText: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
    overflow: 'hidden',
  },
  analyticsBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  analyticsAndroid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
