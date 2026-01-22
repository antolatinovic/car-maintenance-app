/**
 * Home screen header with avatar, greeting and date
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { Avatar } from '@/shared/components/Avatar';

interface HomeHeaderProps {
  userName?: string;
  userAvatar?: string | null;
  onAvatarPress?: () => void;
  onSettingsPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Utilisateur',
  userAvatar,
  onAvatarPress,
  onSettingsPress,
}) => {
  const firstName = userName.split(' ')[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileSection} onPress={onAvatarPress} activeOpacity={0.7}>
        <View style={styles.avatarRing}>
          <Avatar uri={userAvatar} name={userName} size="large" />
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={25}
              tint="light"
              style={styles.settingsBlur}
            >
              <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            </BlurView>
          ) : (
            <View style={styles.settingsAndroid}>
              <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.l,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  greetingContainer: {
    marginLeft: spacing.m,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  settingsBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  settingsAndroid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
