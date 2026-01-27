/**
 * DeleteAccountModal - Confirmation modal for account deletion (RGPD Art. 17)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  isLoading,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConfirm = async () => {
    if (!password.trim()) return;
    await onConfirm(password);
  };

  const handleCancel = () => {
    setPassword('');
    setShowPassword(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Danger icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={32} color={colors.accentDanger} />
          </View>

          <Text style={styles.title}>Supprimer mon compte</Text>

          <Text style={styles.warning}>
            Cette action est irreversible. Toutes vos donnees seront definitivement supprimees :
          </Text>

          <View style={styles.dataList}>
            <Text style={styles.dataItem}>- Profil et parametres</Text>
            <Text style={styles.dataItem}>- Vehicules et photos</Text>
            <Text style={styles.dataItem}>- Historique de maintenance</Text>
            <Text style={styles.dataItem}>- Documents et factures</Text>
            <Text style={styles.dataItem}>- Depenses</Text>
            <Text style={styles.dataItem}>- Conversations IA</Text>
          </View>

          <Text style={styles.passwordLabel}>
            Confirmez votre mot de passe pour continuer :
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.accentDanger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, (!password.trim() || isLoading) && styles.deleteButtonDisabled]}
              onPress={handleConfirm}
              disabled={!password.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textOnColor} />
              ) : (
                <Text style={styles.deleteButtonText}>Supprimer definitivement</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.xl,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.accentDanger}15`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h3,
    color: colors.accentDanger,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  warning: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  dataList: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardRadiusSmall,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  dataItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  passwordLabel: {
    ...typography.captionSemiBold,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardRadiusSmall,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.m,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  eyeButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  errorText: {
    ...typography.caption,
    color: colors.accentDanger,
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.accentDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    ...typography.bodySemiBold,
    color: colors.textOnColor,
  },
});
