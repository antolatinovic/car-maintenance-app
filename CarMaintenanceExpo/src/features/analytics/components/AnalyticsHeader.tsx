/**
 * Analytics screen header with year selector
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface AnalyticsHeaderProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onClose: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedYear,
  availableYears,
  onYearChange,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.m }]}>
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytiques</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.yearsContainer}
      >
        {availableYears.map(year => (
          <TouchableOpacity
            key={year}
            style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
            onPress={() => onYearChange(year)}
          >
            <Text style={[styles.yearText, selectedYear === year && styles.yearTextActive]}>
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    paddingBottom: spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.l,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  yearsContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    gap: spacing.s,
  },
  yearButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: colors.backgroundTertiary,
  },
  yearButtonActive: {
    backgroundColor: colors.accentPrimary,
  },
  yearText: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
  },
  yearTextActive: {
    color: colors.textOnColor,
  },
});
