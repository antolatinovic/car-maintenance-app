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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../core/theme/colors';
import { spacing } from '../../core/theme/spacing';
import { typography } from '../../core/theme/typography';
import { HomeHeader } from './components/HomeHeader';
import { VehicleCard } from './components/VehicleCard';
import { BudgetGrid } from './components/BudgetGrid';
import { UpcomingMaintenance } from './components/UpcomingMaintenance';
import { useHomeData } from './hooks/useHomeData';
import type { Profile } from '../../core/types/database';
import type { BudgetCategory } from './components/BudgetCard';

interface HomeScreenProps {
  userProfile?: Profile | null;
  onAddVehicle?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ userProfile, onAddVehicle }) => {
  const insets = useSafeAreaInsets();
  const { vehicle, budgets, maintenances, isLoading, refresh } = useHomeData();

  // Use profile data if available, fallback to defaults
  const userName = userProfile
    ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Utilisateur'
    : 'Utilisateur';
  const userAvatar = userProfile?.avatar_url || null;

  // Convert budget summary to the format expected by BudgetGrid
  const budgetItems = budgets
    ? [
        { category: 'total' as BudgetCategory, amount: budgets.total, trend: budgets.totalTrend },
        { category: 'fuel' as BudgetCategory, amount: budgets.fuel, trend: budgets.fuelTrend },
        {
          category: 'maintenance' as BudgetCategory,
          amount: budgets.maintenance,
          trend: budgets.maintenanceTrend,
        },
        { category: 'other' as BudgetCategory, amount: budgets.other, trend: budgets.otherTrend },
      ]
    : [];

  // Convert maintenances to the format expected by UpcomingMaintenance
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
    console.log('Notifications pressed');
  };

  const handleAvatarPress = () => {
    console.log('Avatar pressed');
  };

  const handleVehiclePress = () => {
    console.log('Vehicle pressed');
  };

  const handleVehicleEdit = () => {
    console.log('Edit vehicle pressed');
  };

  const handleVehicleQuickAction = (action: 'details' | 'mileage' | 'more') => {
    console.log('Quick action:', action);
  };

  const handleViewAllBudgets = () => {
    console.log('View all budgets');
  };

  const handleBudgetPress = (category: BudgetCategory) => {
    console.log('Budget pressed:', category);
  };

  const handleViewCalendar = () => {
    console.log('View calendar');
  };

  const handleMaintenancePress = (item: { title: string }) => {
    console.log('Maintenance pressed:', item.title);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  // No vehicle state
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <HomeHeader
            userName={userName}
            userAvatar={userAvatar}
            notificationCount={0}
            onNotificationPress={handleNotificationPress}
            onAvatarPress={handleAvatarPress}
          />
          <View style={[styles.emptyState, { marginTop: spacing.xxxl * 2 }]}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="car-outline" size={64} color={colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Aucun vehicule</Text>
            <Text style={styles.emptyDescription}>
              Ajoutez votre premier vehicule pour commencer a suivre son entretien
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={onAddVehicle} activeOpacity={0.8}>
              <Ionicons name="add" size={20} color={colors.textPrimary} />
              <Text style={styles.addButtonText}>Ajouter un vehicule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

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
        />

        {/* Vehicle Card */}
        <View style={styles.section}>
          <VehicleCard
            vehicle={vehicle}
            onPress={handleVehiclePress}
            onEditPress={handleVehicleEdit}
            onQuickAction={handleVehicleQuickAction}
          />
        </View>

        {/* Budget Grid */}
        <View style={styles.section}>
          <BudgetGrid
            budgets={budgetItems}
            onViewAllPress={handleViewAllBudgets}
            onBudgetPress={handleBudgetPress}
          />
        </View>

        {/* Upcoming Maintenance */}
        <View style={styles.section}>
          <UpcomingMaintenance
            items={maintenanceItems}
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
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundSecondary,
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
    backgroundColor: colors.accentPrimary,
    borderRadius: spacing.buttonRadius,
    paddingHorizontal: spacing.xl,
    height: spacing.buttonHeight,
    gap: spacing.s,
  },
  addButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
