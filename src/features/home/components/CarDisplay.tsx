/**
 * CarDisplay - Shows the selected car skin on home screen with floating animation
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, Animated, Easing, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarSkinId } from '@/core/types';
import { DEFAULT_CAR_SKIN, CAR_SKIN_STORAGE_KEY } from '@/core/types';

const CAR_IMAGES: Record<CarSkinId, ReturnType<typeof require>> = {
  classic: require('../../../../assets/cars/car-classic.png'),
  sport: require('../../../../assets/cars/car-sport.png'),
};

interface CarDisplayProps {
  height?: number;
}

export const CarDisplay: React.FC<CarDisplayProps> = ({ height = 200 }) => {
  const [currentSkin, setCurrentSkin] = useState<CarSkinId>(DEFAULT_CAR_SKIN);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const appState = useRef(AppState.currentState);

  const loadSkin = useCallback(async () => {
    try {
      const savedSkin = await AsyncStorage.getItem(CAR_SKIN_STORAGE_KEY);
      if (savedSkin && (savedSkin === 'classic' || savedSkin === 'sport')) {
        setCurrentSkin(savedSkin);
      }
    } catch (error) {
      console.error('Error loading car skin:', error);
    }
  }, []);

  // Load skin on mount
  useEffect(() => {
    loadSkin();
  }, [loadSkin]);

  // Reload skin when app becomes active (returning from settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadSkin();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [loadSkin]);

  // Periodic check for skin changes (when user changes in settings modal)
  useEffect(() => {
    const interval = setInterval(loadSkin, 2000);
    return () => clearInterval(interval);
  }, [loadSkin]);

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

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.imageWrapper, { transform: [{ translateY }] }]}>
        <Image source={CAR_IMAGES[currentSkin]} style={styles.carImage} resizeMode="contain" />
      </Animated.View>
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
});
