/**
 * CarSkinSelector - Modal to select car appearance skin or toggle between photo/skin mode
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows } from '@/core/theme';
import type { CarSkinId, CarDisplayMode } from '@/core/types';
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
  displayMode?: CarDisplayMode;
  onDisplayModeChange?: (mode: CarDisplayMode) => void;
  vehiclePhotoUrl?: string | null;
}

export const CarSkinSelector: React.FC<CarSkinSelectorProps> = ({
  visible,
  currentSkin,
  onSelect,
  onClose,
  displayMode = 'skin',
  onDisplayModeChange,
  vehiclePhotoUrl,
}) => {
  const insets = useSafeAreaInsets();
  const hasPhoto = !!vehiclePhotoUrl;

  const handleSelect = (skinId: CarSkinId) => {
    onSelect(skinId);
    // When selecting a skin, switch to skin mode
    if (onDisplayModeChange && displayMode === 'photo') {
      onDisplayModeChange('skin');
    }
    onClose();
  };

  const handleDisplayModeChange = (mode: CarDisplayMode) => {
    onDisplayModeChange?.(mode);
    if (mode === 'photo') {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom + spacing.l }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Apparence du vehicule</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Display Mode Toggle - Only show if user has a photo */}
          {hasPhoto && onDisplayModeChange && (
            <View style={styles.displayModeSection}>
              <Text style={styles.sectionLabel}>Affichage</Text>
              <View style={styles.displayModeOptions}>
                <TouchableOpacity
                  style={[
                    styles.displayModeCard,
                    displayMode === 'photo' && styles.displayModeCardSelected,
                  ]}
                  onPress={() => handleDisplayModeChange('photo')}
                  activeOpacity={0.7}
                >
                  <View style={styles.displayModeImageContainer}>
                    <ExpoImage
                      source={{ uri: vehiclePhotoUrl }}
                      style={styles.displayModeImage}
                      contentFit="cover"
                    />
                  </View>
                  <Text
                    style={[
                      styles.displayModeName,
                      displayMode === 'photo' && styles.displayModeNameSelected,
                    ]}
                  >
                    Ma photo
                  </Text>
                  {displayMode === 'photo' && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={colors.textOnColor} />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.displayModeCard,
                    displayMode === 'skin' && styles.displayModeCardSelected,
                  ]}
                  onPress={() => handleDisplayModeChange('skin')}
                  activeOpacity={0.7}
                >
                  <View style={styles.displayModeImageContainer}>
                    <Image
                      source={CAR_IMAGES[currentSkin]}
                      style={styles.displayModeSkinImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.displayModeName,
                      displayMode === 'skin' && styles.displayModeNameSelected,
                    ]}
                  >
                    Style
                  </Text>
                  {displayMode === 'skin' && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={colors.textOnColor} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Skin Selection - Show divider if photo section is visible */}
          {hasPhoto && onDisplayModeChange && <View style={styles.divider} />}

          <Text style={styles.subtitle}>
            {hasPhoto ? 'Choisissez un style' : 'Choisissez l\'apparence de votre voiture sur l\'ecran d\'accueil'}
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
                {currentSkin === skin.id && displayMode === 'skin' && (
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
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  displayModeSection: {
    marginBottom: spacing.m,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.s,
  },
  displayModeOptions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  displayModeCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.s,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  displayModeCardSelected: {
    borderColor: colors.accentPrimary,
    backgroundColor: `${colors.accentPrimary}08`,
  },
  displayModeImageContainer: {
    width: '100%',
    height: 60,
    borderRadius: spacing.cardRadius - 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  displayModeImage: {
    width: '100%',
    height: '100%',
  },
  displayModeSkinImage: {
    width: '100%',
    height: '100%',
  },
  displayModeName: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  displayModeNameSelected: {
    color: colors.accentPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.m,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.l,
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
