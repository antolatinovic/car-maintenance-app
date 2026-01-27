/**
 * Expense form modal for adding/editing expenses with gradient accents
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, spacing, typography } from '@/core/theme';
import type { ExpenseType, Expense } from '@/core/types/database';
import type { CreateExpenseData } from '@/services/expenseService';

interface ExpenseFormProps {
  visible: boolean;
  expense?: Expense | null;
  isLoading: boolean;
  onSubmit: (data: Omit<CreateExpenseData, 'vehicle_id'>) => Promise<void>;
  onCancel: () => void;
}

interface TypeOption {
  type: ExpenseType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const typeOptions: TypeOption[] = [
  { type: 'fuel', label: 'Carburant', icon: 'water-outline' },
  { type: 'maintenance', label: 'Entretien', icon: 'build-outline' },
  { type: 'insurance', label: 'Assurance', icon: 'shield-outline' },
  { type: 'parking', label: 'Parking', icon: 'car-outline' },
  { type: 'tolls', label: 'Peages', icon: 'cash-outline' },
  { type: 'fines', label: 'Amendes', icon: 'alert-circle-outline' },
  { type: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  visible,
  expense,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<ExpenseType>('fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [mileage, setMileage] = useState('');

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setType(expense.type);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setDescription(expense.description || '');
      setMileage(expense.mileage?.toString() || '');
    } else {
      setType('fuel');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setMileage('');
    }
  }, [expense, visible]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    const data: Omit<CreateExpenseData, 'vehicle_id'> = {
      type,
      amount: parseFloat(amount),
      date,
      description: description.trim() || undefined,
      mileage: mileage ? parseInt(mileage, 10) : undefined,
    };

    await onSubmit(data);
  };

  const formatDateForInput = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (text: string) => {
    const cleaned = text.replace(/[^\d/]/g, '');
    const match = cleaned.match(/^(\d{1,2})\/?(\d{1,2})?\/?(\d{0,4})?$/);
    if (match) {
      const [, day, month, year] = match;
      if (year && year.length === 4 && month && day) {
        setDate(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Modifier la depense' : 'Nouvelle depense'}</Text>
          <TouchableOpacity
            style={styles.saveButtonWrapper}
            onPress={handleSubmit}
            disabled={isLoading || !amount}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradients.violet}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.saveButton, (isLoading || !amount) && styles.saveButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textOnColor} />
              ) : (
                <Ionicons name="checkmark" size={24} color={colors.textOnColor} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Type de depense</Text>
          <View style={styles.typeGrid}>
            {typeOptions.map(option => {
              const isSelected = type === option.type;
              return (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => setType(option.type)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.violet}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.typeChip}
                    >
                      <Ionicons name={option.icon} size={18} color={colors.textOnColor} />
                      <Text style={[styles.typeChipText, styles.typeChipTextSelected]}>
                        {option.label}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.typeChip, styles.typeChipDefault]}>
                      <Ionicons name={option.icon} size={18} color={colors.textSecondary} />
                      <Text style={styles.typeChipText}>{option.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Informations</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Montant *</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={[styles.input, styles.inputWithoutBorder]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.suffix}>€</Text>
              </View>
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
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Plein d'essence"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kilometrage</Text>
            <View style={styles.inputWithSuffix}>
              <TextInput
                style={[styles.input, styles.inputWithoutBorder]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={mileage}
                onChangeText={setMileage}
                keyboardType="number-pad"
              />
              <Text style={styles.suffix}>km</Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
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
    backgroundColor: colors.backgroundPrimary,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
  sectionTitle: {
    ...typography.captionSemiBold,
    color: colors.accentPrimary,
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
  },
  typeChipDefault: {
    backgroundColor: colors.backgroundTertiary,
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
    color: colors.accentPrimary,
    marginBottom: spacing.s,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.inputPaddingHorizontal,
    height: spacing.inputHeight,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: spacing.m,
  },
  inputWithoutBorder: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: colors.transparent,
  },
  suffix: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
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
