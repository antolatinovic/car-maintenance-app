/**
 * Empty state for analytics when no data is available
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface EmptyAnalyticsProps {
  message?: string;
}

export const EmptyAnalytics: React.FC<EmptyAnalyticsProps> = ({
  message = 'Aucune donnee disponible pour cette periode',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="bar-chart-outline" size={48} color={colors.textTertiary} />
      </View>
      <Text style={styles.title}>Pas encore de statistiques</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>
        Ajoutez des depenses pour voir apparaitre vos statistiques et graphiques.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl * 2,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
