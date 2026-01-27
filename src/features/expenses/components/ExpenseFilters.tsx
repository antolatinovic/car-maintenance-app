/**
 * Expense type filter chips with gradient selection
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
              <View style={[styles.chip, styles.chipDefault]}>
                <Ionicons name={option.icon} size={16} color={colors.textSecondary} />
                <Text style={styles.chipText}>{option.label}</Text>
              </View>
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
  },
  chipDefault: {
    backgroundColor: colors.backgroundTertiary,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textOnColor,
  },
});
