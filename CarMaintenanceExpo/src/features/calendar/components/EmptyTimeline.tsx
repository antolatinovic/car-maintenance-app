/**
 * Empty state for timeline when no maintenance events
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface EmptyTimelineProps {
  onAddPress: () => void;
}

export const EmptyTimeline: React.FC<EmptyTimelineProps> = ({ onAddPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={64} color={colors.accentSuccess} />
      </View>
      <Text style={styles.title}>Tout est en ordre !</Text>
      <Text style={styles.description}>
        Aucune maintenance planifiee pour le moment. Ajoutez-en une pour suivre l'entretien de
        votre vehicule.
      </Text>
      <TouchableOpacity onPress={onAddPress} style={styles.addButton} activeOpacity={0.7}>
        <Ionicons name="add" size={20} color={colors.textOnColor} />
        <Text style={styles.addButtonText}>Ajouter une maintenance</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.xxxl * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.accentSuccess}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.xxl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accentPrimary,
    borderRadius: spacing.buttonRadius,
  },
  addButtonText: {
    ...typography.buttonSmall,
    color: colors.textOnColor,
  },
});
