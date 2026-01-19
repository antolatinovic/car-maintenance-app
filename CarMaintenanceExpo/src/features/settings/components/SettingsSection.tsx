/**
 * Settings Section - Container for grouped settings items
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.m,
    marginLeft: spacing.xs,
  },
  content: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
  },
});
