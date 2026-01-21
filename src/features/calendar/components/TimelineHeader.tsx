/**
 * Timeline header with title, counter and add button
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface TimelineHeaderProps {
  count: number;
  onAddPress: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ count, onAddPress }) => {
  const pluralized = count === 1 ? 'maintenance planifiee' : 'maintenances planifiees';

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Maintenances</Text>
        <Text style={styles.subtitle}>
          {count} {pluralized}
        </Text>
      </View>
      <TouchableOpacity onPress={onAddPress} style={styles.addButton} activeOpacity={0.7}>
        <Ionicons name="add" size={24} color={colors.textOnColor} />
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
    gap: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
