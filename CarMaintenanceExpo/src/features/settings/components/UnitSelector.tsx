/**
 * Unit Selector - Modal to select mileage unit (km/miles)
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';

type MileageUnit = 'km' | 'miles';

interface UnitOption {
  value: MileageUnit;
  label: string;
  description: string;
}

const options: UnitOption[] = [
  {
    value: 'km',
    label: 'Kilometres (km)',
    description: 'Utilise en Europe et dans la plupart des pays',
  },
  {
    value: 'miles',
    label: 'Miles (mi)',
    description: 'Utilise aux Etats-Unis et au Royaume-Uni',
  },
];

interface UnitSelectorProps {
  visible: boolean;
  currentUnit: MileageUnit;
  onSelect: (unit: MileageUnit) => void;
  onClose: () => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  visible,
  currentUnit,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleSelect = (unit: MileageUnit) => {
    onSelect(unit);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.l }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Unite de distance</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.options}>
            {options.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[styles.option, currentUnit === option.value && styles.optionSelected]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radio, currentUnit === option.value && styles.radioSelected]}>
                  {currentUnit === option.value && (
                    <Ionicons name="checkmark" size={16} color={colors.textOnColor} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  options: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: {
    backgroundColor: `${colors.accentPrimary}08`,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
});
