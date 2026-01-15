/**
 * Home screen header with avatar and notifications
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../core/theme/colors';
import { spacing } from '../../../core/theme/spacing';
import { typography } from '../../../core/theme/typography';
import { Avatar } from '../../../shared/components/Avatar';

interface HomeHeaderProps {
  userName?: string;
  userAvatar?: string | null;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Utilisateur',
  userAvatar,
  notificationCount = 0,
  onNotificationPress,
  onAvatarPress,
}) => {
  const firstName = userName.split(' ')[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileSection} onPress={onAvatarPress} activeOpacity={0.7}>
        <Avatar uri={userAvatar} name={userName} size="large" />
        <View style={styles.greetingContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress} activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={spacing.iconMedium} color={colors.textPrimary} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.m,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingContainer: {
    marginLeft: spacing.m,
  },
  welcomeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accentDanger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 10,
  },
});
