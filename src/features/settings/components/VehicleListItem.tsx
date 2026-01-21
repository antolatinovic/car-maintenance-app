/**
 * Vehicle List Item - Row displaying vehicle with primary badge
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { Vehicle } from '@/core/types/database';

interface VehicleListItemProps {
  vehicle: Vehicle;
  isPrimary: boolean;
  onPress: () => void;
}

export const VehicleListItem: React.FC<VehicleListItemProps> = ({
  vehicle,
  isPrimary,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPrimary && styles.containerPrimary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="car-sport" size={20} color={colors.accentPrimary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>
          {vehicle.brand} {vehicle.model}
        </Text>
        {vehicle.registration_plate && (
          <Text style={styles.plate}>{vehicle.registration_plate}</Text>
        )}
      </View>
      {isPrimary ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Principal</Text>
        </View>
      ) : (
        <View style={styles.radioOuter}>
          <View style={styles.radioInner} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  containerPrimary: {
    backgroundColor: `${colors.accentPrimary}08`,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.accentPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  plate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.accentPrimary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: spacing.buttonRadiusSmall,
  },
  badgeText: {
    ...typography.smallMedium,
    color: colors.textOnColor,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 0,
    height: 0,
    borderRadius: 5,
    backgroundColor: colors.accentPrimary,
  },
});
