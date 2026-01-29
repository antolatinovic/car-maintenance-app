/**
 * Assistant Header component with new conversation button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '@/core/theme';

interface AssistantHeaderProps {
  onNewConversation: () => void;
  vehicleName?: string | null;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  onNewConversation,
  vehicleName,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Assistant IA</Text>
        {vehicleName && <Text style={styles.subtitle}>{vehicleName}</Text>}
      </View>

      <TouchableOpacity style={styles.newButton} onPress={onNewConversation} activeOpacity={0.8}>
        <LinearGradient
          colors={gradients.violet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.newButtonGradient}
        >
          <Ionicons name="add" size={24} color={colors.textOnColor} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.l,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  newButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
