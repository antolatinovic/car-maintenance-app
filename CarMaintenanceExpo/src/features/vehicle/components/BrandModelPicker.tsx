/**
 * Brand and Model Picker Component
 * Cascading dropdowns for selecting vehicle make and model
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/core/theme/colors';
import { spacing } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';
import type { CarMake, CarModel } from '@/core/types';
import { useCarData } from '../hooks/useCarData';
import { PickerButton } from './PickerButton';
import { PickerModal } from './PickerModal';

interface BrandModelPickerProps {
  initialBrand?: string;
  initialModel?: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

type ModalType = 'make' | 'model' | null;

export const BrandModelPicker: React.FC<BrandModelPickerProps> = ({
  initialBrand,
  initialModel,
  onBrandChange,
  onModelChange,
  disabled = false,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [manualBrand, setManualBrand] = useState(initialBrand || '');
  const [manualModel, setManualModel] = useState(initialModel || '');

  const {
    makes,
    models,
    isLoadingMakes,
    isLoadingModels,
    makesError,
    modelsError,
    selectedMake,
    selectedModel,
    setSelectedMake,
    setSelectedModel,
    isManualEntry,
    setManualEntry,
  } = useCarData(initialBrand, initialModel);

  // Handlers
  const handleMakeSelect = useCallback(
    (make: CarMake) => {
      setSelectedMake(make);
      onBrandChange(make.make_display);
      setActiveModal(null);
    },
    [setSelectedMake, onBrandChange]
  );

  const handleModelSelect = useCallback(
    (model: CarModel) => {
      setSelectedModel(model);
      onModelChange(model.model_name);
      setActiveModal(null);
    },
    [setSelectedModel, onModelChange]
  );

  const handleSwitchToManual = useCallback(() => {
    setManualEntry(true);
    setManualBrand(selectedMake?.make_display || '');
    setManualModel(selectedModel?.model_name || '');
    setActiveModal(null);
  }, [setManualEntry, selectedMake, selectedModel]);

  const handleSwitchToDropdown = useCallback(() => {
    setManualEntry(false);
  }, [setManualEntry]);

  const handleManualBrandChange = useCallback(
    (text: string) => {
      setManualBrand(text);
      onBrandChange(text);
    },
    [onBrandChange]
  );

  const handleManualModelChange = useCallback(
    (text: string) => {
      setManualModel(text);
      onModelChange(text);
    },
    [onModelChange]
  );

  // Filter functions for modals
  const makeFilterFn = useCallback(
    (make: CarMake, query: string) => {
      const lowerQuery = query.toLowerCase();
      return (
        make.make_display.toLowerCase().includes(lowerQuery) ||
        make.make_id.toLowerCase().includes(lowerQuery)
      );
    },
    []
  );

  const modelFilterFn = useCallback(
    (model: CarModel, query: string) => {
      return model.model_name.toLowerCase().includes(query.toLowerCase());
    },
    []
  );

  // Manual entry mode
  if (isManualEntry) {
    return (
      <View>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Marque *</Text>
            {!makesError && (
              <TouchableOpacity onPress={handleSwitchToDropdown} disabled={disabled}>
                <Text style={styles.switchLink}>Utiliser la liste</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={manualBrand}
            onChangeText={handleManualBrandChange}
            placeholder="Ex: Peugeot, Renault, Toyota..."
            placeholderTextColor={colors.textTertiary}
            editable={!disabled}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Modele *</Text>
          <TextInput
            style={styles.input}
            value={manualModel}
            onChangeText={handleManualModelChange}
            placeholder="Ex: 308, Clio, Yaris..."
            placeholderTextColor={colors.textTertiary}
            editable={!disabled}
          />
        </View>
      </View>
    );
  }

  // Dropdown mode
  return (
    <View>
      {/* Make Picker */}
      <View style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Marque *</Text>
          <TouchableOpacity onPress={handleSwitchToManual} disabled={disabled}>
            <Text style={styles.switchLink}>Saisie manuelle</Text>
          </TouchableOpacity>
        </View>
        <PickerButton
          value={selectedMake?.make_display}
          placeholder="Selectionner une marque"
          onPress={() => setActiveModal('make')}
          disabled={disabled}
          isLoading={isLoadingMakes}
          error={makesError}
        />
      </View>

      {/* Model Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Modele *</Text>
        <PickerButton
          value={selectedModel?.model_name}
          placeholder={selectedMake ? 'Selectionner un modele' : "Choisir d'abord une marque"}
          onPress={() => setActiveModal('model')}
          disabled={disabled || !selectedMake}
          isLoading={isLoadingModels}
          error={modelsError}
        />
      </View>

      {/* Make Modal */}
      <PickerModal<CarMake>
        visible={activeModal === 'make'}
        title="Choisir une marque"
        searchPlaceholder="Rechercher une marque..."
        data={makes}
        selectedId={selectedMake?.make_id}
        keyExtractor={item => item.make_id}
        labelExtractor={item => item.make_display}
        subtitleExtractor={item => item.make_country}
        filterFn={makeFilterFn}
        onSelect={handleMakeSelect}
        onClose={() => setActiveModal(null)}
        onManualEntry={handleSwitchToManual}
        manualEntryLabel="Votre vehicule n'est pas dans la liste ? Saisie manuelle"
      />

      {/* Model Modal */}
      <PickerModal<CarModel>
        visible={activeModal === 'model'}
        title="Choisir un modele"
        searchPlaceholder="Rechercher un modele..."
        data={models}
        selectedId={selectedModel?.model_name}
        keyExtractor={item => item.model_name}
        labelExtractor={item => item.model_name}
        filterFn={modelFilterFn}
        onSelect={handleModelSelect}
        onClose={() => setActiveModal(null)}
        onManualEntry={handleSwitchToManual}
        manualEntryLabel="Votre vehicule n'est pas dans la liste ? Saisie manuelle"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  switchLink: {
    ...typography.caption,
    color: colors.accentPrimary,
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
});
