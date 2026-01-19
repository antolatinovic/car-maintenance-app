/**
 * Picker Button Component
 * Trigger button for opening the picker modal
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { spacing } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';

interface PickerButtonProps {
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const PickerButton: React.FC<PickerButtonProps> = ({
  value,
  placeholder,
  onPress,
  disabled = false,
  isLoading = false,
  error = null,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={colors.textSecondary} />;
    }

    if (error) {
      return <Text style={styles.placeholderText}>{error}</Text>;
    }

    if (value) {
      return <Text style={styles.valueText}>{value}</Text>;
    }

    return <Text style={styles.placeholderText}>{placeholder}</Text>;
  };

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
    >
      {renderContent()}
      <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    height: spacing.inputHeight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textTertiary,
    flex: 1,
  },
});
