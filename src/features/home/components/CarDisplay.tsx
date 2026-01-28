/**
 * CarDisplay - Shows the Carly mascot or user's vehicle photo on home screen with floating animation
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Text,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSignedUrl } from '@/core/utils/storageUtils';
import { colors, spacing, typography } from '@/core/theme';

const MASCOT_IMAGE = require('../../../../assets/Carly_Mascotte.png');

interface CarDisplayProps {
  height?: number;
  vehiclePhotoUrl?: string | null;
  vehicleId?: string;
  onAddPhotoPress?: () => void;
  isUploading?: boolean;
}

export const CarDisplay: React.FC<CarDisplayProps> = ({
  height = 200,
  vehiclePhotoUrl,
  vehicleId,
  onAddPhotoPress,
  isUploading = false,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

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
  const showPhoto = vehiclePhotoUrl && signedPhotoUrl;

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
            source={MASCOT_IMAGE}
            style={styles.carImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
        )}
      </Animated.View>

      {/* Add photo button */}
      {vehicleId && !showPhoto && onAddPhotoPress && (
        <View style={styles.buttonContainer}>
          <GlassButton
            onPress={onAddPhotoPress}
            icon="camera-outline"
            label="Ajouter une photo"
          />
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
