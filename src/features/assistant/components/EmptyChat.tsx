/**
 * Empty chat state with suggestions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { SuggestionChips } from './SuggestionChips';
import { SUGGESTIONS } from '../types';

interface EmptyChatProps {
  onSuggestionPress: (text: string) => void;
  vehicleName?: string | null;
}

export const EmptyChat: React.FC<EmptyChatProps> = ({ onSuggestionPress, vehicleName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color={colors.accentPrimary} />
      </View>

      <Text style={styles.title}>Comment puis-je vous aider ?</Text>

      <Text style={styles.description}>
        Je suis votre assistant automobile. Posez-moi vos questions sur l'entretien
        {vehicleName ? ` de votre ${vehicleName}` : ''}, les problemes mecaniques ou la
        planification de vos maintenances.
      </Text>

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
        <SuggestionChips suggestions={SUGGESTIONS} onPress={onSuggestionPress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal + spacing.l,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.accentPrimary}12`,
    justifyContent: 'center',
    alignItems: 'center',
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
    lineHeight: 24,
    marginBottom: spacing.xxxl,
    maxWidth: 280,
  },
  suggestionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  suggestionsTitle: {
    ...typography.captionMedium,
    color: colors.textTertiary,
    marginBottom: spacing.m,
  },
});
