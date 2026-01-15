/**
 * Car Maintenance App - Main Entry Point
 */

import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/core/theme/colors';
import { TabBar, TabItem, PlaceholderScreen } from './src/shared/components';
import { HomeScreen } from './src/features/home/HomeScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabItem>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
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
        return <HomeScreen />;
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
});
