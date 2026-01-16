/**
 * Car Maintenance App - Main Entry Point
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/core/theme/colors';
import { TabBar, TabItem } from './src/shared/components';
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

export default function App() {
  const { isLoading, isAuthenticated, signIn, signUp, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabItem>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddVehicle = useCallback(() => {
    setShowVehicleForm(true);
  }, []);

  const handleVehicleFormSuccess = useCallback(() => {
    setShowVehicleForm(false);
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleVehicleFormCancel = useCallback(() => {
    setShowVehicleForm(false);
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

  // Loading state while checking auth
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Auth screens
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    );
  }

  // Vehicle form modal
  if (showVehicleForm) {
    return (
      <SafeAreaProvider>
        <VehicleFormScreen
          onSuccess={handleVehicleFormSuccess}
          onCancel={handleVehicleFormCancel}
        />
      </SafeAreaProvider>
    );
  }

  // Settings screen modal
  if (showSettings) {
    return (
      <SafeAreaProvider>
        <SettingsScreen onClose={handleSettingsClose} />
      </SafeAreaProvider>
    );
  }

  // Analytics screen modal
  if (showAnalytics) {
    return (
      <SafeAreaProvider>
        <AnalyticsScreen onClose={handleAnalyticsClose} />
      </SafeAreaProvider>
    );
  }

  // Main app
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            key={refreshKey}
            userProfile={profile}
            onAddVehicle={handleAddVehicle}
            onSettingsPress={handleSettingsPress}
            onAnalyticsPress={handleAnalyticsPress}
          />
        );
      case 'documents':
        return <DocumentsScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'assistant':
        return <AssistantScreen />;
      case 'expenses':
        return <ExpensesScreen onAnalyticsPress={handleAnalyticsPress} />;
      default:
        return (
          <HomeScreen
            key={refreshKey}
            userProfile={profile}
            onAddVehicle={handleAddVehicle}
            onSettingsPress={handleSettingsPress}
            onAnalyticsPress={handleAnalyticsPress}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

        {/* Main content */}
        {renderScreen()}

        {/* Custom Tab Bar with center assistant button */}
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} onCenterPress={handleCenterPress} />
      </View>
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
