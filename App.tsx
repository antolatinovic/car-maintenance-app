/**
 * Car Maintenance App - Main Entry Point
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/core/theme/colors';
import { TabBar, TabItem, FeatureErrorBoundary } from './src/shared/components';
import { AuthProvider, AppProvider } from './src/core/contexts';
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
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  // Auth screens
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
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
      </>
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
    <AuthProvider value={authContextValue}>
      <AppProvider value={appContextValue}>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

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
        </View>
      </AppProvider>
    </AuthProvider>
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
    backgroundColor: colors.backgroundPrimary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
