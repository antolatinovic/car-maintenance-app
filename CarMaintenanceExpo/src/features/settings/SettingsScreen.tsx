/**
 * Settings Screen - User preferences and account management
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/core/theme';
import { useAuth } from '@/features/auth';
import { useSettings, useProfileEdit, useVehicleManagement } from './hooks';
import {
  SettingsHeader,
  SettingsSection,
  SettingsItem,
  SettingsToggle,
  ProfileEditModal,
  VehicleSelector,
  UnitSelector,
  AboutModal,
  LogoutConfirmModal,
} from './components';

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { profile, user, signOut, refreshProfile } = useAuth();

  // Hooks
  const { settings, toggleNotifications, setMileageUnit } = useSettings();
  const { isUpdating, isUploadingAvatar, updateUserProfile, pickAndUploadAvatar } =
    useProfileEdit(refreshProfile);
  const {
    vehicles,
    isLoading: isLoadingVehicles,
    primaryVehicleId,
    setAsPrimary,
  } = useVehicleManagement();

  // Modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handlers
  const handleAvatarPress = useCallback(async () => {
    await pickAndUploadAvatar();
  }, [pickAndUploadAvatar]);

  const handleEditPress = useCallback(() => {
    setShowProfileEdit(true);
  }, []);

  const handleProfileSave = useCallback(
    async (data: { first_name: string; last_name: string }) => {
      return await updateUserProfile(data);
    },
    [updateUserProfile]
  );

  const handleNotificationToggle = useCallback(async () => {
    const success = await toggleNotifications();
    if (!success) {
      Alert.alert('Erreur', 'Impossible de modifier les notifications');
    }
  }, [toggleNotifications]);

  const handleUnitSelect = useCallback(
    async (unit: 'km' | 'miles') => {
      const success = await setMileageUnit(unit);
      if (!success) {
        Alert.alert('Erreur', "Impossible de modifier l'unite");
      }
    },
    [setMileageUnit]
  );

  const handleVehicleSelect = useCallback(
    async (vehicleId: string) => {
      const success = await setAsPrimary(vehicleId);
      if (success) {
        setShowVehicleSelector(false);
      } else {
        Alert.alert('Erreur', 'Impossible de definir le vehicule principal');
      }
    },
    [setAsPrimary]
  );

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
  }, [signOut]);

  // Get primary vehicle name for display
  const primaryVehicle = vehicles.find(v => v.id === primaryVehicleId);
  const primaryVehicleName = primaryVehicle
    ? `${primaryVehicle.brand} ${primaryVehicle.model}`
    : 'Aucun';

  // Get unit display text
  const unitDisplayText = settings?.mileage_unit === 'miles' ? 'Miles' : 'Kilometres';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.l,
            paddingBottom: spacing.tabBarHeight + spacing.xxxl + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with profile */}
        <SettingsHeader
          profile={profile}
          email={user?.email}
          onAvatarPress={handleAvatarPress}
          onEditPress={handleEditPress}
          isUploadingAvatar={isUploadingAvatar}
        />

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsToggle
            icon="notifications-outline"
            label="Notifications"
            description="Rappels de maintenance"
            value={settings?.notification_enabled ?? true}
            onValueChange={handleNotificationToggle}
          />
          <SettingsItem
            icon="speedometer-outline"
            label="Unite de distance"
            value={unitDisplayText}
            onPress={() => setShowUnitSelector(true)}
          />
        </SettingsSection>

        {/* Vehicles Section */}
        <SettingsSection title="Mes vehicules">
          <SettingsItem
            icon="car-sport-outline"
            label="Vehicule principal"
            value={primaryVehicleName}
            onPress={() => setShowVehicleSelector(true)}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="A propos">
          <SettingsItem
            icon="information-circle-outline"
            label="A propos de l'application"
            onPress={() => setShowAbout(true)}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            label="Confidentialite"
            onPress={() => setShowAbout(true)}
          />
        </SettingsSection>

        {/* Logout Section */}
        <SettingsSection>
          <SettingsItem
            icon="log-out-outline"
            label="Deconnexion"
            onPress={() => setShowLogoutConfirm(true)}
            showChevron={false}
            danger
          />
        </SettingsSection>
      </ScrollView>

      {/* Modals */}
      <ProfileEditModal
        visible={showProfileEdit}
        profile={profile}
        onClose={() => setShowProfileEdit(false)}
        onSave={handleProfileSave}
        isLoading={isUpdating}
      />

      <VehicleSelector
        visible={showVehicleSelector}
        vehicles={vehicles}
        primaryVehicleId={primaryVehicleId}
        isLoading={isLoadingVehicles}
        onSelect={handleVehicleSelect}
        onClose={() => setShowVehicleSelector(false)}
      />

      <UnitSelector
        visible={showUnitSelector}
        currentUnit={settings?.mileage_unit ?? 'km'}
        onSelect={handleUnitSelect}
        onClose={() => setShowUnitSelector(false)}
      />

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

      <LogoutConfirmModal
        visible={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isLoading={isLoggingOut}
      />
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
});
