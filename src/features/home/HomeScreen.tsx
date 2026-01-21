/**
 * Home Screen - Main dashboard view
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadows, spacing, typography } from '@/core/theme';
import type { Profile } from '@/core/types/database';
import type { TabItem } from '@/shared/components/TabBar';
import { HomeHeader } from './components/HomeHeader';
import { UpcomingMaintenance } from './components/UpcomingMaintenance';
import { CarDisplay } from './components/CarDisplay';
import { useHomeData } from './hooks/useHomeData';

interface HomeScreenProps {
  userProfile?: Profile | null;
  onAddVehicle?: () => void;
  onSettingsPress?: () => void;
  onAnalyticsPress?: () => void;
  onTabChange?: (tab: TabItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  onAddVehicle,
  onSettingsPress,
  onAnalyticsPress,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const { vehicle, maintenances, isLoading, refresh } = useHomeData();

  const userName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur';
  const userAvatar = userProfile?.avatar_url || null;

  const maintenanceItems = maintenances.map(m => ({
    id: m.id,
    title: m.title,
    category: m.category,
    dueDate: m.dueDate,
    dueMileage: m.dueMileage,
    urgency: m.urgency,
  }));

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Notifications',
      'Les notifications push seront disponibles prochainement.',
      [{ text: 'OK' }]
    );
  };

  const handleAvatarPress = () => {
    onSettingsPress?.();
  };

  const handleViewCalendar = () => {
    onTabChange?.('calendar');
  };

  const handleMaintenancePress = (_item: { title: string }) => {
    onTabChange?.('calendar');
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  // No vehicle state
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <HomeHeader
            userName={userName}
            userAvatar={userAvatar}
            notificationCount={0}
            onNotificationPress={handleNotificationPress}
            onAvatarPress={handleAvatarPress}
            onSettingsPress={onSettingsPress}
          />
          <View style={[styles.emptyState, { marginTop: spacing.xxxl * 2 }]}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-sport" size={48} color={colors.accentPrimary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun vehicule</Text>
            <Text style={styles.emptyDescription}>
              Ajoutez votre premier vehicule pour commencer a suivre son entretien
            </Text>
            <TouchableOpacity onPress={onAddVehicle} activeOpacity={0.9}>
              <LinearGradient
                colors={gradients.violet}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButton}
              >
                <Ionicons name="add" size={22} color={colors.textOnColor} />
                <Text style={styles.addButtonText}>Ajouter un vehicule</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: spacing.tabBarHeight + spacing.xxxl + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
      >
        {/* Header */}
        <HomeHeader
          userName={userName}
          userAvatar={userAvatar}
          notificationCount={2}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={handleAvatarPress}
          onSettingsPress={onSettingsPress}
        />

        {/* Car Display */}
        <View style={styles.carDisplaySection}>
          <CarDisplay height={280} />
        </View>

        {/* Upcoming Maintenance - 2 items */}
        <View style={styles.section}>
          <UpcomingMaintenance
            items={maintenanceItems}
            maxItems={2}
            onViewAllPress={handleViewCalendar}
            onItemPress={handleMaintenancePress}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    marginTop: spacing.l,
  },
  carDisplaySection: {
    marginTop: -spacing.xxxl,
    marginHorizontal: spacing.screenPaddingHorizontal,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.accentPrimary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    maxWidth: 280,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.buttonRadius,
    paddingHorizontal: spacing.xl,
    height: spacing.buttonHeight,
    gap: spacing.s,
    ...shadows.medium,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textOnColor,
  },
});
