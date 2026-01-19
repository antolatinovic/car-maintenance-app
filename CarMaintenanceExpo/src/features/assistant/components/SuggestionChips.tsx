/**
 * Suggestion chips component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/core/theme';
import type { SuggestionItem } from '../types';

interface SuggestionChipsProps {
  suggestions: SuggestionItem[];
  onPress: (text: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onPress }) => {
  return (
    <View style={styles.container}>
      {suggestions.map(suggestion => (
        <TouchableOpacity
          key={suggestion.id}
          style={styles.chip}
          onPress={() => onPress(suggestion.text)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={suggestion.icon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={colors.accentPrimary}
            style={styles.icon}
          />
          <Text style={styles.text} numberOfLines={2}>
            {suggestion.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.buttonRadiusSmall,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    maxWidth: '100%',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  icon: {
    marginRight: spacing.s,
  },
  text: {
    ...typography.caption,
    color: colors.textPrimary,
    flexShrink: 1,
  },
});
