/**
 * Compact Document Card - Simplified version for use in sections
 * Shows document info in a single row
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { Document } from '@/core/types/database';

interface DocumentCardCompactProps {
  document: Document;
  onPress: (document: Document) => void;
  onLongPress?: (document: Document) => void;
}

export const DocumentCardCompact: React.FC<DocumentCardCompactProps> = ({
  document,
  onPress,
  onLongPress,
}) => {
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatAmount = (amount: number | null): string => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardContent = (
    <View style={styles.content}>
      <View style={styles.mainInfo}>
        <Text style={styles.description} numberOfLines={1}>
          {document.description || document.vendor || 'Sans titre'}
        </Text>
        {document.vendor && document.description && (
          <Text style={styles.vendor} numberOfLines={1}>
            {document.vendor}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {document.amount !== null && (
          <Text style={styles.amount}>{formatAmount(document.amount)}</Text>
        )}
        {document.date && <Text style={styles.date}>{formatDate(document.date)}</Text>}
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </View>
  );

  const handlePress = () => onPress(document);
  const handleLongPress = () => onLongPress?.(document);

  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <BlurView intensity={15} tint="light" style={styles.blurContainer}>
          {cardContent}
        </BlurView>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.wrapper, styles.androidContainer]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {cardContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: spacing.cardRadiusSmall,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: spacing.cardRadiusSmall,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  mainInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  description: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  vendor: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginRight: spacing.s,
  },
  amount: {
    ...typography.bodySemiBold,
    color: colors.accentPrimary,
    fontSize: 14,
  },
  date: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
