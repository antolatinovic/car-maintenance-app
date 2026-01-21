/**
 * Assistant Header component with new conversation button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

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
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubble-ellipses" size={24} color={colors.accentPrimary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Assistant IA</Text>
          {vehicleName && <Text style={styles.subtitle}>{vehicleName}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.newButton} onPress={onNewConversation} activeOpacity={0.7}>
        <Ionicons name="add-circle-outline" size={28} color={colors.accentPrimary} />
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
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  newButton: {
    padding: spacing.s,
  },
});
