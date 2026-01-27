/**
 * CarDisplay - Shows the selected car skin or user's photo on home screen with floating animation
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  AppState,
  AppStateStatus,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSignedUrl } from '@/core/utils/storageUtils';
import type { CarSkinId, CarDisplayMode } from '@/core/types';
import {
  DEFAULT_CAR_SKIN,
  CAR_SKIN_STORAGE_KEY,
  CAR_DISPLAY_MODE_KEY,
  DEFAULT_CAR_DISPLAY_MODE,
} from '@/core/types';
import { colors, spacing, typography } from '@/core/theme';

const CAR_IMAGES: Record<CarSkinId, ReturnType<typeof require>> = {
  classic: require('../../../../assets/cars/car-classic.png'),
  sport: require('../../../../assets/cars/car-sport.png'),
};

interface CarDisplayProps {
  height?: number;
  vehiclePhotoUrl?: string | null;
  vehicleId?: string;
  onAddPhotoPress?: () => void;
  isUploading?: boolean;
  displayMode?: CarDisplayMode;
  onToggleMode?: () => void;
}

export const CarDisplay: React.FC<CarDisplayProps> = ({
  height = 200,
  vehiclePhotoUrl,
  vehicleId,
  onAddPhotoPress,
  isUploading = false,
  displayMode: propDisplayMode,
  onToggleMode,
}) => {
  const [currentSkin, setCurrentSkin] = useState<CarSkinId>(DEFAULT_CAR_SKIN);
  const [localDisplayMode, setLocalDisplayMode] = useState<CarDisplayMode>(DEFAULT_CAR_DISPLAY_MODE);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);

  // Use prop display mode if provided, otherwise use local state
  const displayMode = propDisplayMode ?? localDisplayMode;

  const loadPreferences = useCallback(async () => {
    try {
      const [savedSkin, savedMode] = await Promise.all([
        AsyncStorage.getItem(CAR_SKIN_STORAGE_KEY),
        AsyncStorage.getItem(CAR_DISPLAY_MODE_KEY),
      ]);
      if (savedSkin && (savedSkin === 'classic' || savedSkin === 'sport')) {
        setCurrentSkin(savedSkin);
      }
      if (savedMode && (savedMode === 'photo' || savedMode === 'skin')) {
        setLocalDisplayMode(savedMode);
      }
    } catch (error) {
      console.error('Error loading car preferences:', error);
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Reload preferences when app becomes active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadPreferences();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [loadPreferences]);

  // Periodic check for preference changes
  useEffect(() => {
    const interval = setInterval(loadPreferences, 2000);
    return () => clearInterval(interval);
  }, [loadPreferences]);

  // Floating animation
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Resolve signed URL for vehicle photo
  const { url: signedPhotoUrl } = useSignedUrl('vehicles', vehiclePhotoUrl);

  // Determine what to show
  const showPhoto = displayMode === 'photo' && vehiclePhotoUrl && signedPhotoUrl;
  const hasPhoto = !!vehiclePhotoUrl;

  // Glass button component
  const GlassButton: React.FC<{
    onPress: () => void;
    icon: string;
    label?: string;
    disabled?: boolean;
  }> = ({ onPress, icon, label, disabled }) => {
    const content = (
      <>
        {isUploading ? (
          <ActivityIndicator size="small" color={colors.textPrimary} />
        ) : (
          <Ionicons name={icon as never} size={18} color={colors.textPrimary} />
        )}
        {label && <Text style={styles.buttonLabel}>{label}</Text>}
      </>
    );

    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || isUploading}
          activeOpacity={0.8}
        >
          <BlurView intensity={40} tint="light" style={styles.glassButton}>
            {content}
          </BlurView>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.glassButtonAndroid}
        onPress={onPress}
        disabled={disabled || isUploading}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.imageWrapper, { transform: [{ translateY }] }]}>
        {showPhoto ? (
          <Image
            source={{ uri: signedPhotoUrl }}
            style={styles.vehiclePhoto}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <Image
            source={CAR_IMAGES[currentSkin]}
            style={styles.carImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        )}
      </Animated.View>

      {/* Bottom button */}
      {vehicleId && (
        <View style={styles.buttonContainer}>
          {hasPhoto ? (
            // Toggle button when photo exists
            <GlassButton
              onPress={onToggleMode || (() => {})}
              icon="swap-horizontal-outline"
              disabled={!onToggleMode}
            />
          ) : (
            // Add photo button when no photo
            onAddPhotoPress && (
              <GlassButton
                onPress={onAddPhotoPress}
                icon="camera-outline"
                label="Ajouter une photo"
              />
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carImage: {
    width: '95%',
    height: '95%',
  },
  vehiclePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.cardRadius,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.m,
    alignItems: 'center',
  },
  glassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadius,
    gap: spacing.xs,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassButtonAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: spacing.buttonRadius,
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  buttonLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});
