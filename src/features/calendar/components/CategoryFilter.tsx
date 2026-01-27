/**
 * Horizontal category filter chips for calendar
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { MaintenanceCategory } from '@/core/types/database';

type FilterCategory = MaintenanceCategory | 'all';

interface CategoryFilterProps {
  selectedCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
}

interface CategoryOption {
  key: FilterCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const categories: CategoryOption[] = [
  { key: 'all', label: 'Tous', icon: 'apps' },
  { key: 'oil_change', label: 'Vidange', icon: 'water' },
  { key: 'brakes', label: 'Freins', icon: 'disc' },
  { key: 'filters', label: 'Filtres', icon: 'filter' },
  { key: 'tires', label: 'Pneus', icon: 'ellipse' },
  { key: 'mechanical', label: 'Mecanique', icon: 'cog' },
  { key: 'revision', label: 'Revision', icon: 'checkmark-circle' },
  { key: 'ac', label: 'Clim', icon: 'snow' },
  { key: 'distribution', label: 'Distribution', icon: 'git-network' },
  { key: 'suspension', label: 'Amortisseur', icon: 'swap-vertical' },
  { key: 'fluids', label: 'Liquides', icon: 'beaker' },
  { key: 'gearbox_oil', label: 'Boite auto', icon: 'settings' },
  { key: 'custom', label: 'Autre', icon: 'build' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map(category => {
        const isSelected = selectedCategory === category.key;
        return (
          <TouchableOpacity
            key={category.key}
            onPress={() => onCategoryChange(category.key)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon}
              size={16}
              color={isSelected ? colors.textOnColor : colors.textSecondary}
            />
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {category.label}
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
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  chipText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.textOnColor,
  },
});
