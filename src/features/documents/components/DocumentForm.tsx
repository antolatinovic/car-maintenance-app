/**
 * Document form for adding/editing document metadata
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/core/theme';
import type { DocumentType } from '@/core/types/database';
import type { CreateDocumentData } from '@/services/documentService';

interface DocumentFormProps {
  imageUri: string;
  isLoading: boolean;
  onSubmit: (data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'>) => Promise<void>;
  onCancel: () => void;
  defaultType?: DocumentType;
}

interface TypeOption {
  type: DocumentType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const typeOptions: TypeOption[] = [
  { type: 'invoice', label: 'Facture', icon: 'receipt-outline' },
  { type: 'fuel_receipt', label: 'Carburant', icon: 'water-outline' },
  { type: 'insurance', label: 'Assurance', icon: 'shield-checkmark-outline' },
  { type: 'registration', label: 'Carte grise', icon: 'car-outline' },
  { type: 'license', label: 'Permis', icon: 'id-card-outline' },
  { type: 'inspection', label: 'Controle tech.', icon: 'clipboard-outline' },
  { type: 'maintenance', label: 'Entretien', icon: 'construct-outline' },
  { type: 'other', label: 'Autre', icon: 'folder-outline' },
];

export const DocumentForm: React.FC<DocumentFormProps> = ({
  imageUri,
  isLoading,
  onSubmit,
  onCancel,
  defaultType,
}) => {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<DocumentType>(defaultType || 'invoice');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    const data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'> = {
      type,
      description: description.trim() || undefined,
      vendor: vendor.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      date: date || undefined,
      notes: notes.trim() || undefined,
    };

    await onSubmit(data);
  };

  const formatDateForInput = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (text: string) => {
    // Remove non-numeric characters except /
    const cleaned = text.replace(/[^\d/]/g, '');

    // Try to parse DD/MM/YYYY format
    const match = cleaned.match(/^(\d{1,2})\/?(\d{1,2})?\/?(\d{0,4})?$/);
    if (match) {
      const [, day, month, year] = match;
      if (year && year.length === 4 && month && day) {
        setDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
        <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau document</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.textOnColor} />
          ) : (
            <Ionicons name="checkmark" size={24} color={colors.textOnColor} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview image */}
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        </View>

        {/* Type selector */}
        <Text style={styles.sectionTitle}>Type de document</Text>
        <View style={styles.typeGrid}>
          {typeOptions.map(option => (
            <TouchableOpacity
              key={option.type}
              style={[styles.typeChip, type === option.type && styles.typeChipSelected]}
              onPress={() => setType(option.type)}
            >
              <Ionicons
                name={option.icon}
                size={18}
                color={type === option.type ? colors.textOnColor : colors.textSecondary}
              />
              <Text
                style={[styles.typeChipText, type === option.type && styles.typeChipTextSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form fields */}
        <Text style={styles.sectionTitle}>Informations</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vidange moteur"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fournisseur</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Garage Dupont"
            placeholderTextColor={colors.textTertiary}
            value={vendor}
            onChangeText={setVendor}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Montant</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={colors.textTertiary}
              value={formatDateForInput(date)}
              onChangeText={handleDateChange}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Notes supplementaires..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.bottomPadding} />
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
    backgroundColor: colors.backgroundPrimary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 22,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  previewContainer: {
    height: 180,
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.small,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
    marginBottom: spacing.m,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginBottom: spacing.xxl,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  typeChipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  typeChipTextSelected: {
    color: colors.textOnColor,
  },
  inputGroup: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.s,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    height: spacing.inputHeight,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  halfWidth: {
    flex: 1,
  },
  bottomPadding: {
    height: spacing.xxxl,
  },
});
