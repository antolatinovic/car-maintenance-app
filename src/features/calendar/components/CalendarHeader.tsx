/**
 * Calendar header with month navigation and add button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface CalendarHeaderProps {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onAddPress: () => void;
  onTodayPress?: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onAddPress,
  onTodayPress,
}) => {
  // Capitalize first letter
  const formattedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          onPress={onPreviousMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTodayPress}
          style={styles.monthLabelContainer}
          activeOpacity={0.7}
        >
          <Text style={styles.monthLabel}>{formattedLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onAddPress} style={styles.addButton} activeOpacity={0.8}>
        <Ionicons name="add" size={24} color={colors.textOnColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.m,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.backgroundTertiary,
  },
  monthLabelContainer: {
    minWidth: 160,
    alignItems: 'center',
  },
  monthLabel: {
    ...typography.h3,
    color: colors.textPrimary,
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
