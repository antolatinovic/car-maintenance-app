/**
 * Expense card component - displays a single expense with colored left border
 * Uses glassmorphism styling (BlurView on iOS, translucent bg on Android)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { Expense, ExpenseType } from '@/core/types/database';

interface ExpenseCardProps {
  expense: Expense;
  onPress: (expense: Expense) => void;
  onLongPress?: (expense: Expense) => void;
}

const typeConfig: Record<
  ExpenseType,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }
> = {
  fuel: {
    label: 'Carburant',
    icon: 'water-outline',
    color: colors.accentSecondary,
  },
  maintenance: {
    label: 'Entretien',
    icon: 'build-outline',
    color: colors.accentPrimary,
  },
  insurance: {
    label: 'Assurance',
    icon: 'shield-outline',
    color: colors.accentSuccess,
  },
  parking: {
    label: 'Parking',
    icon: 'car-outline',
    color: colors.accentWarning,
  },
  tolls: {
    label: 'Peages',
    icon: 'cash-outline',
    color: '#14B8A6',
  },
  fines: {
    label: 'Amendes',
    icon: 'alert-circle-outline',
    color: colors.accentDanger,
  },
  other: {
    label: 'Autre',
    icon: 'ellipsis-horizontal-outline',
    color: colors.textSecondary,
  },
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress, onLongPress }) => {
  const config = typeConfig[expense.type];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatMileage = (mileage: number | null): string | null => {
    if (mileage === null) return null;
    return `${mileage.toLocaleString('fr-FR')} km`;
  };

  const cardContent = (
    <>
      <View style={[styles.colorStripe, { backgroundColor: config.color }]} />
      <View style={styles.topHighlight} />

      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
          <Ionicons name={config.icon} size={24} color={config.color} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.description || config.label}
          </Text>
          <Text style={[styles.amount, { color: config.color }]}>
            {formatAmount(expense.amount)}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={styles.detailText}>{formatDate(expense.date)}</Text>
          </View>
          {expense.mileage && (
            <View style={styles.detailRow}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.detailText}>{formatMileage(expense.mileage)}</Text>
            </View>
          )}
        </View>

        <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textTertiary}
        style={styles.chevron}
      />
    </>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(expense)}
      onLongPress={() => onLongPress?.(expense)}
      activeOpacity={0.7}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={20} tint="light" style={styles.blurContainer}>
          <View style={[StyleSheet.absoluteFill, styles.glassOverlay]} />
          {cardContent}
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>
          {cardContent}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.m,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  blurContainer: {
    flexDirection: 'row',
    padding: spacing.m,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  androidContainer: {
    flexDirection: 'row',
    padding: spacing.m,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  colorStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: spacing.cardRadius,
    borderBottomLeftRadius: spacing.cardRadius,
  },
  iconContainer: {
    zIndex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: spacing.m,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    flex: 1,
  },
  amount: {
    ...typography.h3,
    marginLeft: spacing.s,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  badge: {
    marginTop: spacing.s,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: spacing.cardRadiusSmall,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: spacing.s,
    zIndex: 1,
  },
});
