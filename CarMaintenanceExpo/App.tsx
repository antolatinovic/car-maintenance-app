/**
 * Car Maintenance App - Main Entry Point
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/core/theme/colors';
import { TabBar, TabItem, PlaceholderScreen } from './src/shared/components';
import { HomeScreen } from './src/features/home/HomeScreen';
import { LoginScreen, SignupScreen, useAuth } from './src/features/auth';
import { VehicleFormScreen } from './src/features/vehicle';

type AuthScreen = 'login' | 'signup';

export default function App() {
  const { isLoading, isAuthenticated, signIn, signUp, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabItem>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddVehicle = useCallback(() => {
    setShowVehicleForm(true);
  }, []);

  const handleVehicleFormSuccess = useCallback(() => {
    setShowVehicleForm(false);
    // Trigger home screen refresh
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleVehicleFormCancel = useCallback(() => {
    setShowVehicleForm(false);
  }, []);

  // Loading state while checking auth
  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Auth screens
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />
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

  // Main app
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen key={refreshKey} userProfile={profile} onAddVehicle={handleAddVehicle} />
        );
      case 'documents':
        return (
          <PlaceholderScreen
            title="Documents"
            icon="document-text"
            description="Scanner et gerer vos factures d'entretien"
          />
        );
      case 'assistant':
        return (
          <PlaceholderScreen
            title="Assistant IA"
            icon="chatbubbles"
            description="Posez vos questions sur votre vehicule"
          />
        );
      case 'calendar':
        return (
          <PlaceholderScreen
            title="Calendrier"
            icon="calendar"
            description="Planifiez et suivez vos maintenances"
          />
        );
      case 'settings':
        return (
          <PlaceholderScreen
            title="Reglages"
            icon="settings"
            description="Personnalisez votre application"
          />
        );
      default:
        return (
          <HomeScreen key={refreshKey} userProfile={profile} onAddVehicle={handleAddVehicle} />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.backgroundPrimary} />

        {/* Main content */}
        {renderScreen()}

        {/* Custom Tab Bar */}
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
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
