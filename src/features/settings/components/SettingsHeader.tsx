/**
 * Settings Header - User avatar, name and email
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { SecureImage } from '@/shared/components';
import type { Profile } from '@/core/types/database';

interface SettingsHeaderProps {
  profile: Profile | null;
  email?: string;
  onAvatarPress: () => void;
  onEditPress: () => void;
  isUploadingAvatar?: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  profile,
  email,
  onAvatarPress,
  onEditPress,
  isUploadingAvatar = false,
}) => {
  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      : 'Utilisateur';

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onAvatarPress}
        activeOpacity={0.8}
        disabled={isUploadingAvatar}
      >
        {profile?.avatar_url ? (
          <SecureImage bucket="avatars" path={profile.avatar_url} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        {isUploadingAvatar ? (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator size="small" color={colors.textOnColor} />
          </View>
        ) : (
          <View style={styles.cameraButton}>
            <Ionicons name="camera" size={14} color={colors.textOnColor} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{fullName}</Text>
        {email && <Text style={styles.email}>{email}</Text>}
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEditPress} activeOpacity={0.7}>
        <Ionicons name="pencil" size={18} color={colors.accentPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.cardRadius,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.h2,
    color: colors.textOnColor,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  info: {
    flex: 1,
    marginLeft: spacing.l,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.accentPrimary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
