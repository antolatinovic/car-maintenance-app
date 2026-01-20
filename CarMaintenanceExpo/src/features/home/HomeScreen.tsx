/**
 * Home Screen - Main dashboard view
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../core/theme/colors';
import { spacing } from '../../core/theme/spacing';
import { HomeHeader } from './components/HomeHeader';
import { VehicleCard } from './components/VehicleCard';
import { BudgetGrid } from './components/BudgetGrid';
import { UpcomingMaintenance } from './components/UpcomingMaintenance';
import type { Vehicle, MaintenanceCategory } from '../../core/types/database';
import type { BudgetCategory } from './components/BudgetCard';

// Mock data - will be replaced with real data from Supabase
const mockUser = {
  firstName: 'Antonin',
  lastName: 'L',
  avatarUrl: null,
};

const mockVehicle: Partial<Vehicle> = {
  id: '1',
  brand: 'Peugeot',
  model: '308',
  year: 2020,
  current_mileage: 45230,
  fuel_type: 'diesel',
  photo_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
};

const mockBudgets = [
  { category: 'total' as BudgetCategory, amount: 2450, trend: 12 },
  { category: 'fuel' as BudgetCategory, amount: 890, trend: -5 },
  { category: 'maintenance' as BudgetCategory, amount: 1200, trend: 8 },
  { category: 'other' as BudgetCategory, amount: 360 },
];

const mockMaintenances = [
  {
    id: '1',
    title: 'Vidange huile moteur',
    category: 'oil_change' as MaintenanceCategory,
    dueDate: '2026-02-15',
    dueMileage: 50000,
    urgency: 'soon' as const,
  },
  {
    id: '2',
    title: 'Controle technique',
    category: 'revision' as MaintenanceCategory,
    dueDate: '2026-03-20',
    urgency: 'upcoming' as const,
  },
  {
    id: '3',
    title: 'Remplacement plaquettes frein',
    category: 'brakes' as MaintenanceCategory,
    dueMileage: 55000,
    urgency: 'upcoming' as const,
  },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Reload data from Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const handleMaintenancePress = (item: any) => {
    console.log('Maintenance pressed:', item.title);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: spacing.tabBarHeight + spacing.xxxl + insets.bottom },
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
          userName={`${mockUser.firstName} ${mockUser.lastName}`}
          userAvatar={mockUser.avatarUrl}
          notificationCount={2}
          onNotificationPress={handleNotificationPress}
          onAvatarPress={handleAvatarPress}
        />

        {/* Vehicle Card */}
        <View style={styles.section}>
          <VehicleCard
            vehicle={mockVehicle}
            onPress={handleVehiclePress}
            onEditPress={handleVehicleEdit}
            onQuickAction={handleVehicleQuickAction}
          />
        </View>

        {/* Budget Grid */}
        <View style={styles.section}>
          <BudgetGrid
            budgets={mockBudgets}
            onViewAllPress={handleViewAllBudgets}
            onBudgetPress={handleBudgetPress}
          />
        </View>

        {/* Upcoming Maintenance */}
        <View style={styles.section}>
          <UpcomingMaintenance
            items={mockMaintenances}
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
});
