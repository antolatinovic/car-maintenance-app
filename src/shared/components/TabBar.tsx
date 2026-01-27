/**
 * Modern Glassmorphism TabBar with floating center button
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, gradients, shadows, spacing, typography } from '@/core/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const documentsIcon = require('../../../assets/documents-icon.png');

export type TabItem = 'home' | 'documents' | 'expenses' | 'calendar' | 'assistant';

interface TabConfig {
  key: TabItem;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const leftTabs: TabConfig[] = [
  {
    key: 'expenses',
    label: 'Depenses',
    icon: 'wallet-outline',
    iconActive: 'wallet',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: 'document-text-outline',
    iconActive: 'document-text',
  },
];

const rightTabs: TabConfig[] = [
  { key: 'calendar', label: 'Calendrier', icon: 'calendar-outline', iconActive: 'calendar' },
  {
    key: 'assistant',
    label: 'Assistant',
    icon: 'chatbubble-ellipses-outline',
    iconActive: 'chatbubble-ellipses',
  },
];

interface TabBarProps {
  activeTab: TabItem;
  onTabPress: (tab: TabItem) => void;
  onCenterPress: () => void;
}

const TabButton: React.FC<{
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => (
  <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
      {tab.key === 'documents' ? (
        <Image
          source={documentsIcon}
          style={[styles.customIcon, !isActive && styles.customIconInactive]}
          resizeMode="contain"
        />
      ) : (
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={22}
          color={isActive ? colors.accentPrimary : colors.textTertiary}
        />
      )}
    </View>
    <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
  </TouchableOpacity>
);

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, onCenterPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.s }]}>
      {/* Glassmorphism tab bar */}
      <View style={styles.tabBarWrapper}>
        <BlurView intensity={80} tint="light" style={styles.blurView}>
          <View style={styles.glassOverlay} />
        </BlurView>

        <View style={styles.tabBarContent}>
          {/* Left tabs */}
          <View style={styles.tabGroup}>
            {leftTabs.map(tab => (
              <TabButton
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onPress={() => onTabPress(tab.key)}
              />
            ))}
          </View>

          {/* Center button placeholder */}
          <View style={styles.centerPlaceholder} />

          {/* Right tabs */}
          <View style={styles.tabGroup}>
            {rightTabs.map(tab => (
              <TabButton
                key={tab.key}
                tab={tab}
                isActive={activeTab === tab.key}
                onPress={() => onTabPress(tab.key)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Floating center button - Home */}
      <TouchableOpacity
        style={styles.centerButtonContainer}
        onPress={onCenterPress}
        activeOpacity={0.85}
      >
        <View style={styles.centerButtonGlow} />
        <LinearGradient
          colors={activeTab === 'home' ? gradients.violet : gradients.purple}
          style={styles.centerButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="car-sport" size={28} color={colors.textOnColor} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const GLASS_BORDER_RADIUS = 28;
const CENTER_BUTTON_SIZE = 62;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarWrapper: {
    width: '100%',
    marginHorizontal: spacing.m,
    borderTopLeftRadius: GLASS_BORDER_RADIUS,
    borderTopRightRadius: GLASS_BORDER_RADIUS,
    overflow: 'hidden',
    ...shadows.large,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.7)',
      android: 'rgba(255, 255, 255, 0.85)',
    }),
    borderTopLeftRadius: GLASS_BORDER_RADIUS,
    borderTopRightRadius: GLASS_BORDER_RADIUS,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    paddingHorizontal: spacing.m,
  },
  tabGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    minWidth: 64,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: `${colors.accentPrimary}15`,
  },
  customIcon: {
    width: 26,
    height: 26,
  },
  customIconInactive: {
    opacity: 0.5,
  },
  label: {
    ...typography.tabLabel,
    marginTop: 2,
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  centerPlaceholder: {
    width: CENTER_BUTTON_SIZE + spacing.m,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -CENTER_BUTTON_SIZE / 3,
    alignSelf: 'center',
  },
  centerButtonGlow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: -4,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: colors.accentPrimary,
    opacity: 0.3,
    ...Platform.select({
      ios: {
        shadowColor: colors.accentPrimary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
