/**
 * Expense type filter chips with gradient selection and glass unselected state
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '@/core/theme';
import type { ExpenseType } from '@/core/types/database';

interface FilterOption {
  type: ExpenseType | null;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const filterOptions: FilterOption[] = [
  { type: null, label: 'Tous', icon: 'grid-outline' },
  { type: 'fuel', label: 'Carburant', icon: 'water-outline' },
  { type: 'maintenance', label: 'Entretien', icon: 'build-outline' },
  { type: 'insurance', label: 'Assurance', icon: 'shield-outline' },
  { type: 'parking', label: 'Parking', icon: 'car-outline' },
  { type: 'tolls', label: 'Peages', icon: 'cash-outline' },
  { type: 'fines', label: 'Amendes', icon: 'alert-circle-outline' },
  { type: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline' },
];

interface ExpenseFiltersProps {
  selectedType: ExpenseType | null;
  onSelectType: (type: ExpenseType | null) => void;
}

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ selectedType, onSelectType }) => {
  const renderDefaultChip = (option: FilterOption) => {
    const chipContent = (
      <>
        <Ionicons name={option.icon} size={16} color={colors.textSecondary} />
        <Text style={styles.chipText}>{option.label}</Text>
      </>
    );

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.chipGlassWrapper}>
          <BlurView intensity={15} tint="light" style={styles.chip}>
            {chipContent}
          </BlurView>
        </View>
      );
    }

    return (
      <View style={[styles.chip, styles.chipAndroid]}>
        {chipContent}
      </View>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filterOptions.map(option => {
        const isSelected = selectedType === option.type;
        return (
          <TouchableOpacity
            key={option.type || 'all'}
            onPress={() => onSelectType(option.type)}
            activeOpacity={0.7}
          >
            {isSelected ? (
              <LinearGradient
                colors={gradients.violet}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.chip}
              >
                <Ionicons name={option.icon} size={16} color={colors.textOnColor} />
                <Text style={[styles.chipText, styles.chipTextSelected]}>{option.label}</Text>
              </LinearGradient>
            ) : (
              renderDefaultChip(option)
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.m,
    gap: spacing.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    overflow: 'hidden',
  },
  chipGlassWrapper: {
    borderRadius: spacing.buttonRadiusSmall,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  chipAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textOnColor,
  },
});
