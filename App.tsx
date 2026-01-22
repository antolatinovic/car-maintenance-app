/**
 * Car Maintenance App - Main Entry Point
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { colors, gradients } from './src/core/theme/colors';
import { TabBar, TabItem, FeatureErrorBoundary, OfflineBanner } from './src/shared/components';
import { AuthProvider, AppProvider, OfflineProvider } from './src/core/contexts';
import { processBatch } from './src/services/syncHandler';
import {
  setNavigationHandler,
  createNotificationResponseListener,
  createNotificationReceivedListener,
} from './src/core/utils/notificationHandler';
import { preloadAssets } from './src/core/utils/preloadAssets';
import {
  configureNotifications,
  requestPermissions,
  scheduleAllMaintenanceNotifications,
} from './src/services/notificationService';
import { getMaintenanceSchedule } from './src/services/maintenanceService';
import { getUserSettings } from './src/services/settingsService';
import { getVehicles } from './src/services/vehicleService';
import type { Vehicle } from './src/core/types/database';
import { HomeScreen } from './src/features/home/HomeScreen';
import { LoginScreen, SignupScreen, useAuth } from './src/features/auth';
import { VehicleFormScreen } from './src/features/vehicle';
import { DocumentsScreen } from './src/features/documents';
import { CalendarScreen } from './src/features/calendar';
import { SettingsScreen } from './src/features/settings';
import { ExpensesScreen } from './src/features/expenses';
import { AssistantScreen } from './src/features/assistant';
import { AnalyticsScreen } from './src/features/analytics';

// Configure notifications at module level
configureNotifications();

type AuthScreen = 'login' | 'signup';

function AppContent() {
  const { isLoading, isAuthenticated, signIn, signUp, signOut, profile, user, refreshProfile } =
    useAuth();
  const [activeTab, setActiveTab] = useState<TabItem>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);
  const notificationReceivedListener = useRef<Notifications.EventSubscription | null>(null);

  // Set up notification handlers and preload assets
  useEffect(() => {
    setNavigationHandler(setActiveTab);

    // Preload images in background
    preloadAssets();

    notificationResponseListener.current = createNotificationResponseListener();
    notificationReceivedListener.current = createNotificationReceivedListener();

    return () => {
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
      if (notificationReceivedListener.current) {
        notificationReceivedListener.current.remove();
      }
    };
  }, []);

  // Initialize notifications when user is authenticated
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!isAuthenticated) return;

      // Check user settings
      const settingsResult = await getUserSettings();
      const notificationsEnabled = settingsResult.data?.notification_enabled ?? true;

      if (!notificationsEnabled) return;

      // Request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      // Get all vehicles and schedule notifications for their maintenances
      const vehiclesResult = await getVehicles();
      if (vehiclesResult.data) {
        for (const vehicle of vehiclesResult.data) {
          const maintenanceResult = await getMaintenanceSchedule(vehicle.id);
          if (maintenanceResult.data) {
            await scheduleAllMaintenanceNotifications(maintenanceResult.data);
          }
        }
      }
    };

    initializeNotifications();
  }, [isAuthenticated]);

  const handleAddVehicle = useCallback(() => {
    setEditingVehicle(null);
    setShowVehicleForm(true);
  }, []);

  const handleVehicleFormSuccess = useCallback(() => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleVehicleFormCancel = useCallback(() => {
    setShowVehicleForm(false);
    setEditingVehicle(null);
  }, []);

  const handleCenterPress = useCallback(() => {
    setActiveTab('home');
  }, []);

  const handleSettingsPress = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleAnalyticsPress = useCallback(() => {
    setShowAnalytics(true);
  }, []);

  const handleAnalyticsClose = useCallback(() => {
    setShowAnalytics(false);
  }, []);

  const refreshHome = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Context values
  const authContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signOut,
    refreshProfile,
  };

  const appContextValue = {
    openVehicleForm: (vehicle?: Vehicle) => {
      setEditingVehicle(vehicle || null);
      setShowVehicleForm(true);
    },
    closeVehicleForm: handleVehicleFormCancel,
    openSettings: handleSettingsPress,
    closeSettings: handleSettingsClose,
    openAnalytics: handleAnalyticsPress,
    closeAnalytics: handleAnalyticsClose,
    navigateToTab: setActiveTab,
    refreshHome,
  };

  // Loading state while checking auth
  if (isLoading) {
    return (
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, styles.loadingContainer]}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </LinearGradient>
    );
  }

  // Auth screens
  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={gradients.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {authScreen === 'login' ? (
          <LoginScreen
            onLogin={signIn}
            onNavigateToSignup={() => setAuthScreen('signup')}
            isLoading={isLoading}
          />
        ) : (
          <SignupScreen
            onSignup={signUp}
            onNavigateToLogin={() => setAuthScreen('login')}
            isLoading={isLoading}
          />
        )}
      </LinearGradient>
    );
  }

  // Main app with modals
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <FeatureErrorBoundary featureName="Accueil">
            <HomeScreen
              key={refreshKey}
              userProfile={profile}
              onAddVehicle={handleAddVehicle}
              onSettingsPress={handleSettingsPress}
              onAnalyticsPress={handleAnalyticsPress}
              onTabChange={setActiveTab}
            />
          </FeatureErrorBoundary>
        );
      case 'documents':
        return (
          <FeatureErrorBoundary featureName="Documents">
            <DocumentsScreen />
          </FeatureErrorBoundary>
        );
      case 'calendar':
        return (
          <FeatureErrorBoundary featureName="Calendrier">
            <CalendarScreen />
          </FeatureErrorBoundary>
        );
      case 'assistant':
        return (
          <FeatureErrorBoundary featureName="Assistant">
            <AssistantScreen />
          </FeatureErrorBoundary>
        );
      case 'expenses':
        return (
          <FeatureErrorBoundary featureName="Depenses">
            <ExpensesScreen onAnalyticsPress={handleAnalyticsPress} />
          </FeatureErrorBoundary>
        );
      default:
        return (
          <FeatureErrorBoundary featureName="Accueil">
            <HomeScreen
              key={refreshKey}
              userProfile={profile}
              onAddVehicle={handleAddVehicle}
              onSettingsPress={handleSettingsPress}
              onAnalyticsPress={handleAnalyticsPress}
              onTabChange={setActiveTab}
            />
          </FeatureErrorBoundary>
        );
    }
  };

  return (
    <OfflineProvider onSync={processBatch}>
      <AuthProvider value={authContextValue}>
        <AppProvider value={appContextValue}>
          <LinearGradient
            colors={gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0, 0.5, 1]}
            style={styles.container}
          >
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Offline status banner */}
            <OfflineBanner />

            {/* Main content */}
            {renderScreen()}

            {/* Custom Tab Bar with center assistant button */}
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} onCenterPress={handleCenterPress} />

            {/* Vehicle Form Modal */}
            <Modal visible={showVehicleForm} animationType="slide" presentationStyle="fullScreen">
              <FeatureErrorBoundary featureName="Formulaire Vehicule">
                <VehicleFormScreen
                  vehicle={editingVehicle || undefined}
                  onSuccess={handleVehicleFormSuccess}
                  onCancel={handleVehicleFormCancel}
                />
              </FeatureErrorBoundary>
            </Modal>

            {/* Settings Modal */}
            <Modal visible={showSettings} animationType="slide" presentationStyle="fullScreen">
              <FeatureErrorBoundary featureName="Parametres">
                <SettingsScreen onClose={handleSettingsClose} />
              </FeatureErrorBoundary>
            </Modal>

            {/* Analytics Modal */}
            <Modal visible={showAnalytics} animationType="slide" presentationStyle="fullScreen">
              <FeatureErrorBoundary featureName="Statistiques">
                <AnalyticsScreen onClose={handleAnalyticsClose} />
              </FeatureErrorBoundary>
            </Modal>
          </LinearGradient>
        </AppProvider>
      </AuthProvider>
    </OfflineProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
