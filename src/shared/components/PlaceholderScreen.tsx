/**
 * Placeholder screen for tabs not yet implemented
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';

interface PlaceholderScreenProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  title,
  icon,
  description,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={48} color={colors.accentPrimary} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.badge}>
          <Ionicons name="time-outline" size={14} color={colors.accentPrimary} />
          <Text style={styles.badgeText}>Bientot disponible</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.accentPrimary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    maxWidth: 280,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: `${colors.accentPrimary}10`,
    borderRadius: spacing.buttonRadius,
  },
  badgeText: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
  },
});
