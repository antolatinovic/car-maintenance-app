/**
 * Expense type filter chips
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
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
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelectType(option.type)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={isSelected ? colors.textOnColor : colors.textSecondary}
            />
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option.label}
            </Text>
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
    backgroundColor: colors.cardBackground,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textOnColor,
  },
});
