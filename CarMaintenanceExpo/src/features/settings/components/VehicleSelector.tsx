/**
 * Vehicle Selector - Modal to select primary vehicle
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';
import type { Vehicle } from '@/core/types/database';
import { VehicleListItem } from './VehicleListItem';

interface VehicleSelectorProps {
  visible: boolean;
  vehicles: Vehicle[];
  primaryVehicleId: string | null;
  isLoading: boolean;
  onSelect: (vehicleId: string) => void;
  onClose: () => void;
  onAddVehicle?: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  visible,
  vehicles,
  primaryVehicleId,
  isLoading,
  onSelect,
  onClose,
  onAddVehicle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.l }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Mes vehicules</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Selectionnez le vehicule que vous utilisez principalement
          </Text>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.accentPrimary} />
            </View>
          ) : vehicles.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="car-sport-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Aucun vehicule enregistre</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              <View style={styles.listContent}>
                {vehicles.map(vehicle => (
                  <VehicleListItem
                    key={vehicle.id}
                    vehicle={vehicle}
                    isPrimary={vehicle.id === primaryVehicleId}
                    onPress={() => onSelect(vehicle.id)}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          {/* Add Vehicle Button */}
          {onAddVehicle && (
            <TouchableOpacity style={styles.addButton} onPress={onAddVehicle} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={24} color={colors.textOnColor} />
              <Text style={styles.addButtonText}>Ajouter un vehicule</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  container: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: spacing.cardRadius,
    borderTopRightRadius: spacing.cardRadius,
    paddingTop: spacing.m,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.s,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginBottom: spacing.l,
  },
  list: {
    flex: 1,
  },
  listContent: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: spacing.screenPaddingHorizontal,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
  },
  loading: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  empty: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.m,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginTop: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
    gap: spacing.s,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textOnColor,
  },
});
