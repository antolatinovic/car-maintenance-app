/**
 * Settings Item - Clickable row with icon, label and chevron
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  iconColor,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.accentDanger : iconColor || colors.accentPrimary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.accentPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  iconContainerDanger: {
    backgroundColor: `${colors.accentDanger}15`,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  labelDanger: {
    color: colors.accentDanger,
  },
  value: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
