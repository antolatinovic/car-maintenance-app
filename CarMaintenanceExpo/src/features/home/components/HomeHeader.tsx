/**
 * Home screen header with avatar, greeting and date
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, typography } from '@/core/theme';
import { Avatar } from '@/shared/components/Avatar';

interface HomeHeaderProps {
  userName?: string;
  userAvatar?: string | null;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onSettingsPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Utilisateur',
  userAvatar,
  notificationCount = 0,
  onNotificationPress,
  onAvatarPress,
  onSettingsPress,
}) => {
  const firstName = userName.split(' ')[0];

  // Format current date
  const formatDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return now.toLocaleDateString('fr-FR', options);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profileSection} onPress={onAvatarPress} activeOpacity={0.7}>
        <View style={styles.avatarRing}>
          <Avatar uri={userAvatar} name={userName} size="large" />
        </View>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Bonjour,</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightSection}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
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
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: spacing.cardRadiusSmall,
  },
  dateText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentDanger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.cardBackground,
  },
  badgeText: {
    ...typography.small,
    color: colors.textOnColor,
    fontWeight: '700',
    fontSize: 10,
  },
});
