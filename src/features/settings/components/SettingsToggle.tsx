/**
 * Settings Toggle - Row with icon, label and switch
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface SettingsToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  icon,
  iconColor,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={iconColor || colors.accentPrimary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: `${colors.accentPrimary}60`,
        }}
        thumbColor={value ? colors.accentPrimary : colors.backgroundSecondary}
        ios_backgroundColor={colors.border}
        style={Platform.OS === 'ios' ? styles.switchIOS : undefined}
      />
    </View>
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
  containerDisabled: {
    opacity: 0.5,
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
  content: {
    flex: 1,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  switchIOS: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
});
