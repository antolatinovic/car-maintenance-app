/**
 * Vehicle hero card component - Modern light mode design
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadows, spacing, typography } from '../../../core/theme';
import type { Vehicle, FuelType } from '../../../core/types/database';

interface VehicleCardProps {
  vehicle: Partial<Vehicle>;
  onPress?: () => void;
  onEditPress?: () => void;
  onQuickAction?: (action: 'details' | 'mileage' | 'more') => void;
}

const fuelTypeLabels: Record<FuelType, string> = {
  gasoline: 'Essence',
  diesel: 'Diesel',
  electric: 'Electrique',
  hybrid: 'Hybride',
};

const fuelTypeIcons: Record<FuelType, keyof typeof Ionicons.glyphMap> = {
  gasoline: 'water',
  diesel: 'water',
  electric: 'flash',
  hybrid: 'leaf',
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  onEditPress,
  onQuickAction,
}) => {
  const formatMileage = (km?: number | null) => {
    if (!km) return '--';
    return km.toLocaleString('fr-FR');
  };

  const fuelLabel = vehicle.fuel_type ? fuelTypeLabels[vehicle.fuel_type] : '--';
  const fuelIcon = vehicle.fuel_type ? fuelTypeIcons[vehicle.fuel_type] : 'help';

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      {/* Header with gradient */}
      <LinearGradient
        colors={gradients.violet}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.vehicleName}>
              {vehicle.brand} {vehicle.model}
            </Text>
            {vehicle.registration_plate && (
              <Text style={styles.licensePlate}>{vehicle.registration_plate}</Text>
            )}
          </View>

          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Ionicons name="pencil" size={18} color={colors.accentPrimary} />
          </TouchableOpacity>
        </View>

        {/* Vehicle image */}
        <Image
          source={{ uri: vehicle.photo_url || defaultImage }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.accentPrimary}15` }]}>
            <Ionicons name="speedometer" size={20} color={colors.accentPrimary} />
          </View>
          <Text style={styles.statValue}>{formatMileage(vehicle.current_mileage)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.accentSuccess}15` }]}>
            <Ionicons name={fuelIcon} size={20} color={colors.accentSuccess} />
          </View>
          <Text style={styles.statValue}>{fuelLabel}</Text>
          <Text style={styles.statLabel}>Carburant</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.accentWarning}15` }]}>
            <Ionicons name="calendar" size={20} color={colors.accentWarning} />
          </View>
          <Text style={styles.statValue}>{vehicle.year || '--'}</Text>
          <Text style={styles.statLabel}>Annee</Text>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onQuickAction?.('details')}>
          <Ionicons name="information-circle-outline" size={20} color={colors.accentPrimary} />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={() => onQuickAction?.('mileage')}>
          <Ionicons name="speedometer-outline" size={20} color={colors.accentPrimary} />
          <Text style={styles.actionText}>Kilometrage</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity style={styles.actionButton} onPress={() => onQuickAction?.('more')}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.accentPrimary} />
          <Text style={styles.actionText}>Plus</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    ...shadows.medium,
  },
  header: {
    padding: spacing.cardPadding,
    paddingBottom: 80,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleName: {
    ...typography.h2,
    color: colors.textOnColor,
  },
  licensePlate: {
    ...typography.captionMedium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  vehicleImage: {
    position: 'absolute',
    bottom: -40,
    right: spacing.l,
    width: 180,
    height: 100,
    borderRadius: spacing.cardRadiusSmall,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.cardPadding,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.m,
    gap: spacing.m,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.m,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardRadiusSmall,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    gap: spacing.s,
  },
  actionText: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
  },
  actionDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
});
