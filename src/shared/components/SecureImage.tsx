/**
 * SecureImage - Image component that resolves signed URLs from private Supabase storage
 */

import React from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';
import { colors } from '@/core/theme';
import { useSignedUrl } from '@/core/utils/storageUtils';
import type { BucketName } from '@/core/utils/storageUtils';

interface SecureImageProps {
  bucket: BucketName;
  path: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholderColor?: string;
}

export const SecureImage: React.FC<SecureImageProps> = ({
  bucket,
  path,
  style,
  resizeMode = 'cover',
  placeholderColor = colors.backgroundTertiary,
}) => {
  const { url, loading } = useSignedUrl(bucket, path);

  if (!path) return null;

  if (loading) {
    return (
      <View style={[styles.placeholder, style, { backgroundColor: placeholderColor }]}>
        <ActivityIndicator size="small" color={colors.textTertiary} />
      </View>
    );
  }

  if (!url) {
    return <View style={[styles.placeholder, style, { backgroundColor: placeholderColor }]} />;
  }

  return <Image source={{ uri: url }} style={style} resizeMode={resizeMode} />;
};

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
