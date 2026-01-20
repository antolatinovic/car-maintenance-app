/**
 * Custom minimal TabBar component
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../core/theme/colors';
import { spacing } from '../../core/theme/spacing';
import { typography } from '../../core/theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabItem = 'home' | 'documents' | 'assistant' | 'calendar' | 'settings';

interface TabConfig {
  key: TabItem;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const tabs: TabConfig[] = [
  { key: 'home', label: 'Accueil', icon: 'home-outline', iconActive: 'home' },
  { key: 'documents', label: 'Documents', icon: 'document-text-outline', iconActive: 'document-text' },
  { key: 'assistant', label: 'Assistant', icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { key: 'calendar', label: 'Calendrier', icon: 'calendar-outline', iconActive: 'calendar' },
  { key: 'settings', label: 'Reglages', icon: 'settings-outline', iconActive: 'settings' },
];

interface TabBarProps {
  activeTab: TabItem;
  onTabPress: (tab: TabItem) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || spacing.s }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={spacing.iconMedium}
                color={isActive ? colors.accentPrimary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? colors.accentPrimary : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.tabBarMargin,
    paddingTop: spacing.s,
    backgroundColor: colors.backgroundPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.tabBarRadius,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.tabLabel,
    marginTop: spacing.xs,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -spacing.xs,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accentPrimary,
  },
});
