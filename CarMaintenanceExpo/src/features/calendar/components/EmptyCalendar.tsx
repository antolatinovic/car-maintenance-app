/**
 * Empty state for calendar when no maintenances are scheduled
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface EmptyCalendarProps {
  selectedDate?: Date;
  onAddPress?: () => void;
}

export const EmptyCalendar: React.FC<EmptyCalendarProps> = ({ selectedDate, onAddPress }) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'ce jour';
    const isToday = new Date().toDateString() === date.toDateString();
    if (isToday) return "aujourd'hui";
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={48} color={colors.accentPrimary} />
      </View>

      <Text style={styles.title}>Aucune maintenance</Text>
      <Text style={styles.description}>
        Aucune maintenance planifiee pour {formatDate(selectedDate)}
      </Text>

      {onAddPress && (
        <TouchableOpacity onPress={onAddPress} style={styles.addButton} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={colors.accentPrimary} />
          <Text style={styles.addButtonText}>Planifier une maintenance</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.s,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accentPrimary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.l,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: `${colors.accentPrimary}10`,
  },
  addButtonText: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
  },
});
