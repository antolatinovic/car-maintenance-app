/**
 * Empty state component for expenses
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface EmptyExpensesProps {
  hasFilters?: boolean;
  onAddExpense: () => void;
  onClearFilters?: () => void;
}

export const EmptyExpenses: React.FC<EmptyExpensesProps> = ({
  hasFilters = false,
  onAddExpense,
  onClearFilters,
}) => {
  if (hasFilters) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
        </View>
        <Text style={styles.title}>Aucun resultat</Text>
        <Text style={styles.description}>Aucune depense ne correspond a ce filtre</Text>
        {onClearFilters && (
          <TouchableOpacity style={styles.button} onPress={onClearFilters}>
            <Text style={styles.buttonText}>Effacer les filtres</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="wallet-outline" size={48} color={colors.textTertiary} />
      </View>
      <Text style={styles.title}>Aucune depense</Text>
      <Text style={styles.description}>
        Commencez a suivre vos depenses pour mieux gerer votre budget auto
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onAddExpense}>
        <Ionicons name="add" size={20} color={colors.textOnColor} />
        <Text style={styles.primaryButtonText}>Ajouter une depense</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
  },
  buttonText: {
    ...typography.button,
    color: colors.accentPrimary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.textOnColor,
  },
});
