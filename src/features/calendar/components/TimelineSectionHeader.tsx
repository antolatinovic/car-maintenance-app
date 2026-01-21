/**
 * Section header for timeline grouping (Today, Tomorrow, Month)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';

export type SectionType = 'overdue' | 'today' | 'tomorrow' | 'future';

interface TimelineSectionHeaderProps {
  title: string;
  count: number;
  type: SectionType;
}

const sectionConfig: Record<SectionType, { backgroundColor: string; textColor: string }> = {
  overdue: {
    backgroundColor: `${colors.accentDanger}10`,
    textColor: colors.accentDanger,
  },
  today: {
    backgroundColor: `${colors.accentPrimary}10`,
    textColor: colors.accentPrimary,
  },
  tomorrow: {
    backgroundColor: colors.backgroundTertiary,
    textColor: colors.textPrimary,
  },
  future: {
    backgroundColor: colors.backgroundTertiary,
    textColor: colors.textPrimary,
  },
};

export const TimelineSectionHeader: React.FC<TimelineSectionHeaderProps> = ({
  title,
  count,
  type,
}) => {
  const config = sectionConfig[type];

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.title, { color: config.textColor }]}>{title}</Text>
      <View style={[styles.countBadge, { backgroundColor: config.textColor }]}>
        <Text style={styles.countText}>{count}</Text>
      </View>
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
    marginTop: spacing.l,
  },
  title: {
    ...typography.bodySemiBold,
  },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.s,
  },
  countText: {
    ...typography.smallMedium,
    color: colors.textOnColor,
  },
});
