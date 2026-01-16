/**
 * Premium TabBar with floating center button
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows, spacing, typography } from '../../core/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabItem = 'home' | 'documents' | 'assistant' | 'calendar' | 'settings';

interface TabConfig {
  key: TabItem;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

// 4 tabs: 2 on left, 2 on right of center button
const leftTabs: TabConfig[] = [
  {
    key: 'assistant',
    label: 'Assistant',
    icon: 'chatbubble-ellipses-outline',
    iconActive: 'chatbubble-ellipses',
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
  { key: 'settings', label: 'Reglages', icon: 'settings-outline', iconActive: 'settings' },
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
    <Ionicons
      name={isActive ? tab.iconActive : tab.icon}
      size={24}
      color={isActive ? colors.accentPrimary : colors.textTertiary}
    />
    <Text style={[styles.label, { color: isActive ? colors.accentPrimary : colors.textTertiary }]}>
      {tab.label}
    </Text>
    {isActive && <View style={styles.activeIndicator} />}
  </TouchableOpacity>
);

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress, onCenterPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.s }]}>
      <View style={styles.tabBar}>
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

      {/* Floating center button - Home */}
      <TouchableOpacity
        style={styles.centerButtonContainer}
        onPress={onCenterPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={activeTab === 'home' ? gradients.violet : gradients.purple}
          style={styles.centerButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="car-sport" size={26} color={colors.textOnColor} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: spacing.tabBarRadius,
    borderTopRightRadius: spacing.tabBarRadius,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
    paddingHorizontal: spacing.l,
    width: '100%',
    ...shadows.large,
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
    minWidth: 60,
  },
  label: {
    ...typography.tabLabel,
    marginTop: spacing.xs,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentPrimary,
  },
  centerPlaceholder: {
    width: spacing.fabSize + spacing.l,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -spacing.fabSize / 2 + spacing.s,
    alignSelf: 'center',
    ...shadows.large,
  },
  centerButton: {
    width: spacing.fabSize,
    height: spacing.fabSize,
    borderRadius: spacing.fabSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
