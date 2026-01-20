/**
 * Vehicle hero card component
 */

import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
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
  gasoline: 'water-outline',
  diesel: 'water-outline',
  electric: 'flash-outline',
  hybrid: 'leaf-outline',
};

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPress,
  onEditPress,
  onQuickAction,
}) => {
  const formatMileage = (km?: number | null) => {
    if (!km) return '-- km';
    return `${km.toLocaleString('fr-FR')} km`;
  };

  const fuelLabel = vehicle.fuel_type ? fuelTypeLabels[vehicle.fuel_type] : '--';
  const fuelIcon = vehicle.fuel_type ? fuelTypeIcons[vehicle.fuel_type] : 'help-outline';

  const defaultImage = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <ImageBackground
        source={{ uri: vehicle.photo_url || defaultImage }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          {/* Edit button */}
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Ionicons name="pencil" size={16} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Vehicle info */}
          <View style={styles.infoContainer}>
            <Text style={styles.vehicleName}>
              {vehicle.brand} {vehicle.model}
            </Text>

            <View style={styles.detailsRow}>
              {/* Mileage */}
              <View style={styles.detailItem}>
                <Ionicons name="speedometer-outline" size={16} color={colors.accentPrimary} />
                <Text style={styles.detailText}>{formatMileage(vehicle.current_mileage)}</Text>
              </View>

              {/* Fuel type */}
              <View style={styles.detailItem}>
                <Ionicons name={fuelIcon} size={16} color={colors.accentSuccess} />
                <Text style={styles.detailText}>{fuelLabel}</Text>
              </View>

              {/* Year */}
              {vehicle.year && (
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.accentWarning} />
                  <Text style={styles.detailText}>{vehicle.year}</Text>
                </View>
              )}
            </View>

            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => onQuickAction?.('details')}
              >
                <Ionicons name="information-circle-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.quickActionText}>Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => onQuickAction?.('mileage')}
              >
                <Ionicons name="speedometer-outline" size={18} color={colors.textPrimary} />
                <Text style={styles.quickActionText}>Kilometrage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => onQuickAction?.('more')}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textPrimary} />
                <Text style={styles.quickActionText}>Plus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
  },
  imageBackground: {
    height: 220,
  },
  image: {
    borderRadius: spacing.cardRadius,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.cardPadding,
  },
  editButton: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    gap: spacing.s,
  },
  vehicleName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.l,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: spacing.m,
    gap: spacing.s,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: spacing.buttonRadius,
  },
  quickActionText: {
    ...typography.small,
    color: colors.textPrimary,
  },
});
