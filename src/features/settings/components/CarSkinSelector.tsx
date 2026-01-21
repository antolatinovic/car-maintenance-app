/**
 * CarSkinSelector - Modal to select car appearance skin
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows } from '@/core/theme';
import type { CarSkinId } from '@/core/types';
import { CAR_SKINS } from '@/core/types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - spacing.screenPaddingHorizontal * 2 - spacing.m) / 2;

const CAR_IMAGES: Record<CarSkinId, ReturnType<typeof require>> = {
  classic: require('../../../../assets/cars/car-classic.png'),
  sport: require('../../../../assets/cars/car-sport.png'),
};

interface CarSkinSelectorProps {
  visible: boolean;
  currentSkin: CarSkinId;
  onSelect: (skinId: CarSkinId) => void;
  onClose: () => void;
}

export const CarSkinSelector: React.FC<CarSkinSelectorProps> = ({
  visible,
  currentSkin,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  const handleSelect = (skinId: CarSkinId) => {
    onSelect(skinId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.l }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Style de voiture</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Choisissez l'apparence de votre voiture sur l'ecran d'accueil
          </Text>

          <View style={styles.options}>
            {CAR_SKINS.map(skin => (
              <TouchableOpacity
                key={skin.id}
                style={[styles.skinCard, currentSkin === skin.id && styles.skinCardSelected]}
                onPress={() => handleSelect(skin.id)}
                activeOpacity={0.7}
              >
                <View style={styles.imageContainer}>
                  <Image source={CAR_IMAGES[skin.id]} style={styles.carImage} resizeMode="contain" />
                </View>
                <Text style={[styles.skinName, currentSkin === skin.id && styles.skinNameSelected]}>
                  {skin.name}
                </Text>
                {currentSkin === skin.id && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color={colors.textOnColor} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
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
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  skinCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.m,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  skinCardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: `${colors.accentPrimary}08`,
  },
  imageContainer: {
    width: CARD_WIDTH - spacing.m * 2,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  skinName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  skinNameSelected: {
    color: colors.accentPrimary,
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
