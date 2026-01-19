/**
 * Document type filter chips
 */

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { DocumentType } from '@/core/types/database';

interface FilterOption {
  type: DocumentType | null;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const filterOptions: FilterOption[] = [
  { type: null, label: 'Tous', icon: 'grid-outline' },
  { type: 'invoice', label: 'Factures', icon: 'receipt-outline' },
  { type: 'fuel_receipt', label: 'Carburant', icon: 'water-outline' },
  { type: 'insurance', label: 'Assurance', icon: 'shield-checkmark-outline' },
  { type: 'administrative', label: 'Admin', icon: 'document-text-outline' },
  { type: 'other', label: 'Autres', icon: 'folder-outline' },
];

interface DocumentFiltersProps {
  selectedType: DocumentType | null;
  onSelectType: (type: DocumentType | null) => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({ selectedType, onSelectType }) => {
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
