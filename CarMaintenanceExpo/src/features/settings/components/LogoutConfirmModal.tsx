/**
 * Logout Confirm Modal - Confirmation dialog before sign out
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';

interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
          disabled={isLoading}
        />
        <View style={[styles.container, { marginBottom: insets.bottom }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={32} color={colors.accentDanger} />
          </View>

          <Text style={styles.title}>Se deconnecter ?</Text>
          <Text style={styles.message}>
            Vous devrez vous reconnecter pour acceder a votre compte et a vos donnees.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.textOnColor} />
              ) : (
                <Text style={styles.confirmButtonText}>Deconnexion</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    padding: spacing.screenPaddingHorizontal,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.accentDanger}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.m,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: spacing.buttonHeight,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  confirmButton: {
    flex: 1,
    height: spacing.buttonHeight,
    borderRadius: spacing.buttonRadius,
    backgroundColor: colors.accentDanger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.textOnColor,
  },
});
