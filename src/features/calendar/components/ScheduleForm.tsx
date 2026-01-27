/**
 * Schedule form modal for creating/editing maintenance schedules
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows, spacing, typography } from '@/core/theme';
import type { MaintenanceCategory, ReminderType, RecurrenceType } from '@/core/types/database';
import type { CreateScheduleData } from '@/services/maintenanceService';
import type { CalendarMaintenance } from '../hooks/useMaintenanceSchedules';

interface ScheduleFormProps {
  visible: boolean;
  vehicleId: string;
  selectedDate: Date;
  editingSchedule?: CalendarMaintenance | null;
  onClose: () => void;
  onSubmit: (data: CreateScheduleData) => void;
}

interface CategoryOption {
  key: MaintenanceCategory;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const categories: CategoryOption[] = [
  { key: 'oil_change', label: 'Vidange', icon: 'water' },
  { key: 'brakes', label: 'Freins', icon: 'disc' },
  { key: 'filters', label: 'Filtres', icon: 'filter' },
  { key: 'tires', label: 'Pneus', icon: 'ellipse' },
  { key: 'mechanical', label: 'Mecanique', icon: 'cog' },
  { key: 'revision', label: 'Revision', icon: 'checkmark-circle' },
  { key: 'ac', label: 'Climatisation', icon: 'snow' },
  { key: 'distribution', label: 'Distribution', icon: 'git-network' },
  { key: 'suspension', label: 'Amortisseur', icon: 'swap-vertical' },
  { key: 'fluids', label: 'Liquides', icon: 'beaker' },
  { key: 'gearbox_oil', label: 'Vidange boite auto', icon: 'settings' },
  { key: 'custom', label: 'Autre', icon: 'build' },
];

const reminderTypes: { key: ReminderType; label: string }[] = [
  { key: 'date', label: 'Par date' },
  { key: 'mileage', label: 'Par kilometrage' },
  { key: 'both', label: 'Les deux' },
];

const recurrenceTypes: { key: RecurrenceType; label: string }[] = [
  { key: 'none', label: 'Aucune' },
  { key: 'monthly', label: 'Mensuelle' },
  { key: 'yearly', label: 'Annuelle' },
  { key: 'km_based', label: 'Par km' },
];

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  visible,
  vehicleId,
  selectedDate,
  editingSchedule,
  onClose,
  onSubmit,
}) => {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<MaintenanceCategory>('oil_change');
  const [description, setDescription] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('date');
  const [dueDate, setDueDate] = useState('');
  const [dueMileage, setDueMileage] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Reset form when opening
  useEffect(() => {
    if (visible) {
      if (editingSchedule) {
        setCategory(editingSchedule.category);
        setDescription(editingSchedule.description || '');
        setReminderType(editingSchedule.reminder_type);
        setDueDate(editingSchedule.due_date?.split('T')[0] || '');
        setDueMileage(editingSchedule.due_mileage?.toString() || '');
        setRecurrence(editingSchedule.recurrence_type);
        setEstimatedCost(editingSchedule.estimated_cost?.toString() || '');
        setLocation(editingSchedule.location || '');
        setNotes(editingSchedule.notes || '');
      } else {
        setCategory('oil_change');
        setDescription('');
        setReminderType('date');
        setDueDate(selectedDate.toISOString().split('T')[0]);
        setDueMileage('');
        setRecurrence('none');
        setEstimatedCost('');
        setLocation('');
        setNotes('');
      }
    }
  }, [visible, editingSchedule, selectedDate]);

  const handleSubmit = () => {
    const data: CreateScheduleData = {
      vehicle_id: vehicleId,
      category,
      description: description || undefined,
      reminder_type: reminderType,
      due_date: reminderType !== 'mileage' && dueDate ? dueDate : undefined,
      due_mileage: reminderType !== 'date' && dueMileage ? parseInt(dueMileage, 10) : undefined,
      recurrence_type: recurrence,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      location: location || undefined,
      notes: notes || undefined,
    };

    onSubmit(data);
  };

  const isValid =
    category &&
    ((reminderType === 'date' && dueDate) ||
      (reminderType === 'mileage' && dueMileage) ||
      (reminderType === 'both' && dueDate && dueMileage));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingSchedule ? 'Modifier' : 'Planifier une maintenance'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isValid}
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveButtonText, !isValid && styles.saveButtonTextDisabled]}>
              {editingSchedule ? 'Modifier' : 'Ajouter'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categorie *</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={[
                    styles.categoryButton,
                    category === cat.key && styles.categoryButtonSelected,
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={category === cat.key ? colors.textOnColor : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat.key && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex: Vidange + filtre a huile"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Reminder type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de rappel *</Text>
            <View style={styles.optionRow}>
              {reminderTypes.map(type => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setReminderType(type.key)}
                  style={[
                    styles.optionButton,
                    reminderType === type.key && styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      reminderType === type.key && styles.optionButtonTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due date */}
          {reminderType !== 'mileage' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date prevue *</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="AAAA-MM-JJ"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          )}

          {/* Due mileage */}
          {reminderType !== 'date' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kilometrage prevu *</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={dueMileage}
                  onChangeText={setDueMileage}
                  placeholder="Ex: 45000"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
                <Text style={styles.inputSuffix}>km</Text>
              </View>
            </View>
          )}

          {/* Recurrence */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recurrence</Text>
            <View style={styles.optionRow}>
              {recurrenceTypes.map(type => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setRecurrence(type.key)}
                  style={[
                    styles.optionButton,
                    recurrence === type.key && styles.optionButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      recurrence === type.key && styles.optionButtonTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated cost */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cout estime</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                placeholder="Ex: 150"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
              <Text style={styles.inputSuffix}>EUR</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lieu / Garage</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ex: Garage Dupont"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes additionnelles..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  saveButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    backgroundColor: colors.accentPrimary,
    borderRadius: spacing.buttonRadiusSmall,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border,
  },
  saveButtonText: {
    ...typography.buttonSmall,
    color: colors.textOnColor,
  },
  saveButtonTextDisabled: {
    color: colors.textTertiary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPaddingHorizontal,
    gap: spacing.l,
  },
  section: {
    gap: spacing.s,
  },
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  categoryButtonText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
  },
  categoryButtonTextSelected: {
    color: colors.textOnColor,
  },
  input: {
    height: spacing.inputHeight,
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  inputFlex: {
    flex: 1,
  },
  inputSuffix: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.m,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  optionButton: {
    flex: 1,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderRadius: spacing.buttonRadiusSmall,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionButtonSelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  optionButtonText: {
    ...typography.smallMedium,
    color: colors.textSecondary,
  },
  optionButtonTextSelected: {
    color: colors.textOnColor,
  },
});
