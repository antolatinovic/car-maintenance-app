/**
 * Quota display component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { QuotaInfo } from '../types';

interface QuotaDisplayProps {
  quota: QuotaInfo | null;
}

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ quota }) => {
  if (!quota) return null;

  const percentage = Math.round((quota.used / quota.limit) * 100);
  const isLow = percentage >= 80;
  const isExceeded = quota.isExceeded;

  const getStatusColor = () => {
    if (isExceeded) return colors.accentDanger;
    if (isLow) return colors.accentWarning;
    return colors.accentSuccess;
  };

  const formatResetDate = () => {
    const resetDate = new Date(quota.resetAt);
    const day = resetDate.getDate();
    const month = resetDate.toLocaleString('fr-FR', { month: 'short' });
    return `${day} ${month}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Ionicons
          name={quota.isPremium ? 'star' : 'sparkles-outline'}
          size={14}
          color={quota.isPremium ? colors.accentWarning : colors.textTertiary}
        />
        <Text style={styles.label}>{quota.isPremium ? 'Premium' : 'Gratuit'}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
        <Text style={[styles.countText, isExceeded && styles.exceededText]}>
          {quota.used}/{quota.limit}
        </Text>
      </View>

      {isExceeded && <Text style={styles.resetText}>Reset le {formatResetDate()}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: spacing.cardRadiusSmall,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: spacing.s,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  countText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
    minWidth: 45,
    textAlign: 'right',
  },
  exceededText: {
    color: colors.accentDanger,
  },
  resetText: {
    ...typography.small,
    color: colors.accentDanger,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
