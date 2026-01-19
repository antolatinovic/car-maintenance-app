/**
 * Document scanner component - camera and gallery picker
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '@/core/theme';
import { useDocumentScanner, ScannedImage } from '../hooks/useDocumentScanner';

interface DocumentScannerProps {
  onScanComplete: (image: ScannedImage) => void;
  onCancel: () => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScanComplete, onCancel }) => {
  const insets = useSafeAreaInsets();
  const { openCamera, openGallery, isScanning } = useDocumentScanner();

  const handleCameraPress = async () => {
    const result = await openCamera();
    if (result) {
      onScanComplete(result);
    }
  };

  const handleGalleryPress = async () => {
    const result = await openGallery();
    if (result) {
      onScanComplete(result);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter un document</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Scannez une facture avec votre camera ou importez un document depuis votre galerie
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleCameraPress}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.accentPrimary }]}>
              <Ionicons name="camera" size={32} color={colors.textOnColor} />
            </View>
            <Text style={styles.optionTitle}>Scanner</Text>
            <Text style={styles.optionDescription}>
              Prenez une photo d'un document avec votre camera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleGalleryPress}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.accentSecondary }]}>
              <Ionicons name="images" size={32} color={colors.textOnColor} />
            </View>
            <Text style={styles.optionTitle}>Galerie</Text>
            <Text style={styles.optionDescription}>
              Importez une image depuis votre galerie photo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingVertical: spacing.m,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.xxl,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  optionsContainer: {
    gap: spacing.l,
  },
  optionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPaddingLarge,
    alignItems: 'center',
    ...shadows.medium,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  optionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.s,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
