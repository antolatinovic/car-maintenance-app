/**
 * Vehicle hero card component - Simplified Hero Image design
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import type { Vehicle } from '@/core/types/database';

// Image 3D par défaut quand pas de photo
// eslint-disable-next-line @typescript-eslint/no-require-imports
const defaultCarImage = require('../../../../assets/default-car.png');

interface VehicleCardProps {
  vehicle: Partial<Vehicle>;
  onPress?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onPress }) => {
  const formatMileage = (km?: number | null) => {
    if (!km) return '--';
    return km.toLocaleString('fr-FR');
  };

  const hasCustomPhoto = !!vehicle.photo_url;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* Hero Image */}
      <Image
        source={hasCustomPhoto ? { uri: vehicle.photo_url } : defaultCarImage}
        style={styles.heroImage}
        resizeMode="contain"
      />

      {/* Info row: Name + Edit icon */}
      <View style={styles.infoContainer}>
        <Text style={styles.vehicleName}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <View style={styles.editIcon}>
          <Ionicons name="pencil" size={18} color={colors.textSecondary} />
        </View>
      </View>

      {/* Stats pills */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Ionicons name="speedometer-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{formatMileage(vehicle.current_mileage)} km</Text>
        </View>
        <View style={styles.statPill}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{vehicle.year || '--'}</Text>
        </View>
        {vehicle.registration_plate && (
          <View style={styles.statPill}>
            <Text style={styles.statText}>{vehicle.registration_plate}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // No background, no shadow - blends with screen background
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.m,
    paddingHorizontal: spacing.xs,
  },
  vehicleName: {
    ...typography.h2,
    color: colors.textPrimary,
    flex: 1,
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.m,
    paddingHorizontal: spacing.xs,
    gap: spacing.s,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 20,
    gap: spacing.s,
  },
  statText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
});
