/**
 * Avatar component with placeholder support
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';
import { SecureImage } from './SecureImage';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: spacing.avatarSmall,
  medium: spacing.avatarMedium,
  large: spacing.avatarLarge,
};

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'medium' }) => {
  const dimension = sizeMap[size];
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      style={[
        styles.container,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {uri ? (
        <SecureImage
          bucket="avatars"
          path={uri}
          style={[
            styles.image,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: dimension, height: dimension, borderRadius: dimension / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: dimension * 0.4 }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.bodyMedium,
    color: colors.textOnColor,
    fontWeight: '600',
  },
});
