/**
 * Offline Banner Component
 * Displays status banner when offline or syncing
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { spacing } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';
import { useOfflineContext } from '@/core/contexts';

export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const { isOnline, isSyncing, pendingOperationsCount, syncError, triggerSync } = useOfflineContext();

  // Don't show anything if online with no pending operations and no error
  if (isOnline && pendingOperationsCount === 0 && !syncError && !isSyncing) {
    return null;
  }

  // Determine banner type and content
  let backgroundColor: string;
  let icon: keyof typeof Ionicons.glyphMap;
  let message: string;
  let showRetry = false;

  if (syncError) {
    // Error state
    backgroundColor = colors.accentDanger;
    icon = 'alert-circle';
    message = syncError;
    showRetry = true;
  } else if (isSyncing) {
    // Syncing state
    backgroundColor = colors.accentSecondary;
    icon = 'sync';
    message = 'Synchronisation en cours...';
  } else if (!isOnline) {
    // Offline state
    backgroundColor = colors.accentWarning;
    icon = 'cloud-offline';
    message = pendingOperationsCount > 0
      ? `Mode hors ligne - ${pendingOperationsCount} modification${pendingOperationsCount > 1 ? 's' : ''} en attente`
      : 'Mode hors ligne';
  } else if (pendingOperationsCount > 0) {
    // Online but still has pending (shouldn't happen often)
    backgroundColor = colors.accentSecondary;
    icon = 'sync';
    message = `${pendingOperationsCount} modification${pendingOperationsCount > 1 ? 's' : ''} en attente`;
  } else {
    return null;
  }

  const handlePress = () => {
    if (showRetry && isOnline) {
      triggerSync();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={showRetry ? 0.7 : 1}
      onPress={handlePress}
      disabled={!showRetry}
    >
      <View style={[styles.container, { backgroundColor, paddingTop: insets.top > 0 ? insets.top : spacing.xs }]}>
        <View style={styles.content}>
          <Ionicons
            name={icon}
            size={18}
            color={colors.textOnColor}
            style={styles.icon}
          />
          <Text style={styles.message} numberOfLines={1}>
            {message}
          </Text>
          {showRetry && (
            <Text style={styles.retryText}>Appuyez pour reessayer</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.l,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  message: {
    ...typography.caption,
    color: colors.textOnColor,
    fontWeight: '500',
  },
  retryText: {
    ...typography.small,
    color: colors.textOnColor,
    opacity: 0.8,
    marginLeft: spacing.s,
  },
});
