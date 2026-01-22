/**
 * GlassCard component with real glassmorphism effect
 * Transparent frosted glass with blur and subtle borders
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { spacing } from '@/core/theme';

type GlassVariant = 'light' | 'medium' | 'dark';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: GlassVariant;
  /** Disable blur effect (useful for performance) */
  noBlur?: boolean;
}

// Glass configurations for different variants
const glassConfig = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    blurIntensity: 20,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    blurIntensity: 30,
  },
  dark: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    blurIntensity: 40,
  },
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  variant = 'light',
  noBlur = false,
}) => {
  const config = glassConfig[variant];

  const renderCard = () => {
    if (Platform.OS === 'ios' && !noBlur) {
      // iOS: Real blur effect with BlurView
      return (
        <View style={[styles.card, { borderColor: config.borderColor }, style]}>
          <BlurView
            intensity={config.blurIntensity}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          {/* Overlay for glass tint */}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: config.backgroundColor },
            ]}
          />
          {/* Top highlight for glass effect */}
          <View style={styles.highlight} />
          {/* Content */}
          <View style={styles.content}>{children}</View>
        </View>
      );
    }

    // Android or noBlur: Semi-transparent background
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
          style,
        ]}
      >
        {/* Top highlight for glass effect */}
        <View style={styles.highlight} />
        {/* Content */}
        <View style={styles.content}>{children}</View>
      </View>
    );
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {renderCard()}
      </Pressable>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    // Content sits above the blur
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
