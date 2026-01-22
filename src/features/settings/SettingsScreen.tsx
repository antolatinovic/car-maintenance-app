/**
 * Settings Screen - User preferences and account management
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Alert, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/core/theme';
import { useAuthContext, useAppContext, useOfflineContext } from '@/core/contexts';
import { useSettings, useProfileEdit, useVehicleManagement, useCarSkin } from './hooks';
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
  CarSkinSelector,
} from './components';
import { CAR_SKINS } from '@/core/types';
import type { CarSkinId } from '@/core/types';

interface SettingsScreenProps {
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { profile, user, signOut, refreshProfile } = useAuthContext();
  const { openVehicleForm } = useAppContext();

  // Hooks
  const { settings, toggleNotifications, setMileageUnit } = useSettings();
  const { isUpdating, isUploadingAvatar, updateUserProfile, pickAndUploadAvatar } =
    useProfileEdit(refreshProfile);
  const { vehicles, isLoading: isLoadingVehicles, primaryVehicleId, setAsPrimary } =
    useVehicleManagement();
  const { currentSkin, setSkin, displayMode, setDisplayMode } = useCarSkin();
  const { debugForceOffline, setDebugForceOffline, isOnline, pendingOperationsCount } = useOfflineContext();

  // Modal states
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showCarSkinSelector, setShowCarSkinSelector] = useState(false);

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

  const handleAddVehicle = useCallback(() => {
    setShowVehicleSelector(false);
    openVehicleForm();
  }, [openVehicleForm]);

  const handleCarSkinSelect = useCallback(
    async (skinId: CarSkinId) => {
      const success = await setSkin(skinId);
      if (!success) {
        Alert.alert('Erreur', 'Impossible de changer le style de voiture');
      }
    },
    [setSkin]
  );

  const handleDebugOfflineToggle = useCallback(() => {
    setDebugForceOffline(!debugForceOffline);
  }, [debugForceOffline, setDebugForceOffline]);

  const handleDisplayModeChange = useCallback(
    async (mode: 'photo' | 'skin') => {
      const success = await setDisplayMode(mode);
      if (!success) {
        Alert.alert('Erreur', 'Impossible de changer le mode d\'affichage');
      }
    },
    [setDisplayMode]
  );

  // Get primary vehicle info for display
  const primaryVehicle = vehicles.find(v => v.id === primaryVehicleId);
  const primaryVehicleName = primaryVehicle
    ? `${primaryVehicle.brand} ${primaryVehicle.model}`
    : 'Aucun';
  const primaryVehiclePhotoUrl = primaryVehicle?.photo_url || null;

  // Get unit display text
  const unitDisplayText = settings?.mileage_unit === 'miles' ? 'Miles' : 'Kilometres';

  // Get car skin display text
  const currentSkinData = CAR_SKINS.find(s => s.id === currentSkin);
  const carSkinDisplayText = currentSkinData?.name ?? 'Classique';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />

      {/* Back button header when shown as modal */}
      {onClose && (
        <View style={[styles.topHeader, { paddingTop: insets.top + spacing.m }]}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>Reglages</Text>
          <View style={styles.backButton} />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: onClose ? spacing.m : insets.top + spacing.l,
            paddingBottom: onClose ? spacing.xxxl + insets.bottom : spacing.tabBarHeight + spacing.xxxl + insets.bottom,
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
          <SettingsItem
            icon="color-palette-outline"
            label="Style de voiture"
            value={carSkinDisplayText}
            onPress={() => setShowCarSkinSelector(true)}
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

        {/* Debug Section */}
        <SettingsSection title="Debug (Dev)">
          <SettingsToggle
            icon="cloud-offline-outline"
            label="Simuler mode hors-ligne"
            description={isOnline ? 'Actuellement en ligne' : `Hors ligne${pendingOperationsCount > 0 ? ` (${pendingOperationsCount} en attente)` : ''}`}
            value={debugForceOffline}
            onValueChange={handleDebugOfflineToggle}
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
        onAddVehicle={handleAddVehicle}
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

      <CarSkinSelector
        visible={showCarSkinSelector}
        currentSkin={currentSkin}
        onSelect={handleCarSkinSelect}
        onClose={() => setShowCarSkinSelector(false)}
        displayMode={displayMode}
        onDisplayModeChange={handleDisplayModeChange}
        vehiclePhotoUrl={primaryVehiclePhotoUrl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
});
