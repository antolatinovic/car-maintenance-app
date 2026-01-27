/**
 * Document type filter chips
 * Glassmorphism design aligned with home screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
  { type: 'registration', label: 'Carte grise', icon: 'car-outline' },
  { type: 'license', label: 'Permis', icon: 'id-card-outline' },
  { type: 'inspection', label: 'CT', icon: 'clipboard-outline' },
  { type: 'maintenance', label: 'Entretien', icon: 'construct-outline' },
  { type: 'other', label: 'Autres', icon: 'folder-outline' },
];

interface DocumentFiltersProps {
  selectedType: DocumentType | null;
  onSelectType: (type: DocumentType | null) => void;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({ selectedType, onSelectType }) => {
  const renderChipContent = (option: FilterOption, isSelected: boolean) => (
    <>
      <Ionicons
        name={option.icon}
        size={16}
        color={isSelected ? colors.accentPrimary : colors.textSecondary}
      />
      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
        {option.label}
      </Text>
    </>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filterOptions.map(option => {
        const isSelected = selectedType === option.type;

        if (isSelected) {
          // Selected chip with glass effect
          return (
            <TouchableOpacity
              key={option.type || 'all'}
              style={styles.chipWrapper}
              onPress={() => onSelectType(option.type)}
              activeOpacity={0.7}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={20} tint="light" style={styles.chipSelected}>
                  <View style={styles.chipSelectedOverlay}>
                    {renderChipContent(option, true)}
                  </View>
                </BlurView>
              ) : (
                <View style={[styles.chip, styles.chipSelectedAndroid]}>
                  {renderChipContent(option, true)}
                </View>
              )}
            </TouchableOpacity>
          );
        }

        // Unselected chip
        return (
          <TouchableOpacity
            key={option.type || 'all'}
            style={[styles.chipWrapper, styles.chip]}
            onPress={() => onSelectType(option.type)}
            activeOpacity={0.7}
          >
            {renderChipContent(option, false)}
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
  chipWrapper: {
    borderRadius: spacing.buttonRadiusSmall,
    overflow: 'hidden',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  chipSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.buttonRadiusSmall,
    overflow: 'hidden',
  },
  chipSelectedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: `${colors.accentPrimary}15`,
    borderWidth: 1,
    borderColor: `${colors.accentPrimary}40`,
    borderRadius: spacing.buttonRadiusSmall,
  },
  chipSelectedAndroid: {
    backgroundColor: `${colors.accentPrimary}15`,
    borderColor: `${colors.accentPrimary}40`,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
});
