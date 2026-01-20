/**
 * Vehicle Form Screen - Add or edit a vehicle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { spacing } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';
import { createVehicle, updateVehicle, CreateVehicleData } from '@/services/vehicleService';
import type { Vehicle, FuelType } from '@/core/types/database';
import { BrandModelPicker } from './components/BrandModelPicker';

interface VehicleFormScreenProps {
  vehicle?: Vehicle;
  onSuccess: () => void;
  onCancel: () => void;
}

type FuelOption = { value: FuelType; label: string };

const fuelOptions: FuelOption[] = [
  { value: 'gasoline', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electrique' },
  { value: 'hybrid', label: 'Hybride' },
];

export const VehicleFormScreen: React.FC<VehicleFormScreenProps> = ({
  vehicle,
  onSuccess,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState<CreateVehicleData>({
    brand: vehicle?.brand || '',
    model: vehicle?.model || '',
    year: vehicle?.year || undefined,
    registration_plate: vehicle?.registration_plate || undefined,
    current_mileage: vehicle?.current_mileage || undefined,
    fuel_type: vehicle?.fuel_type || undefined,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    field: keyof CreateVehicleData,
    value: string | number | FuelType | undefined
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!formData.brand.trim()) {
      setError('Veuillez entrer la marque du vehicule');
      return;
    }
    if (!formData.model.trim()) {
      setError('Veuillez entrer le modele du vehicule');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && vehicle) {
        const result = await updateVehicle(vehicle.id, formData);
        if (result.error) {
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
      } else {
        const result = await createVehicle(formData);
        if (result.error) {
          setError(result.error.message);
          setIsLoading(false);
          return;
        }
      }

      onSuccess();
    } catch (err) {
      setError('Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <TouchableOpacity onPress={onCancel} disabled={isLoading}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Modifier le vehicule' : 'Ajouter un vehicule'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand & Model Picker */}
        <BrandModelPicker
          initialBrand={vehicle?.brand}
          initialModel={vehicle?.model}
          onBrandChange={value => handleChange('brand', value)}
          onModelChange={value => handleChange('model', value)}
          disabled={isLoading}
        />

        {/* Year */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Annee</Text>
          <TextInput
            style={styles.input}
            value={formData.year?.toString() || ''}
            onChangeText={value => {
              const num = parseInt(value, 10);
              handleChange('year', isNaN(num) ? undefined : num);
            }}
            placeholder="Ex: 2020"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            maxLength={4}
            editable={!isLoading}
          />
        </View>

        {/* Registration Plate */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Immatriculation</Text>
          <TextInput
            style={styles.input}
            value={formData.registration_plate || ''}
            onChangeText={value => handleChange('registration_plate', value || undefined)}
            placeholder="Ex: AB-123-CD"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            editable={!isLoading}
          />
        </View>

        {/* Current Mileage */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kilometrage actuel</Text>
          <TextInput
            style={styles.input}
            value={formData.current_mileage?.toString() || ''}
            onChangeText={value => {
              const num = parseInt(value, 10);
              handleChange('current_mileage', isNaN(num) ? undefined : num);
            }}
            placeholder="Ex: 45000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            editable={!isLoading}
          />
        </View>

        {/* Fuel Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carburant</Text>
          <View style={styles.fuelOptions}>
            {fuelOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.fuelOption,
                  formData.fuel_type === option.value && styles.fuelOptionSelected,
                ]}
                onPress={() => handleChange('fuel_type', option.value)}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.fuelOptionText,
                    formData.fuel_type === option.value && styles.fuelOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.accentDanger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Enregistrer' : 'Ajouter le vehicule'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.xxxl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    height: spacing.inputHeight,
    ...typography.body,
    color: colors.textPrimary,
  },
  fuelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  fuelOption: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fuelOptionSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  fuelOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  fuelOptionTextSelected: {
    color: colors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: spacing.buttonRadius,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  errorText: {
    ...typography.caption,
    color: colors.accentDanger,
    marginLeft: spacing.s,
    flex: 1,
  },
  submitButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: spacing.buttonRadius,
    height: spacing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.m,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
