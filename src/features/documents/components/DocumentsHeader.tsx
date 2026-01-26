/**
 * Documents screen header with search
 * Glassmorphism design aligned with home screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';

interface DocumentsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddPress: () => void;
  documentCount: number;
}

export const DocumentsHeader: React.FC<DocumentsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddPress,
  documentCount,
}) => {
  const insets = useSafeAreaInsets();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const renderSearchContent = () => (
    <>
      <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un document..."
        placeholderTextColor={colors.textTertiary}
        value={searchQuery}
        onChangeText={onSearchChange}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange('')}>
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.m }]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>
            {documentCount} document{documentCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButtonWrapper} onPress={onAddPress} activeOpacity={0.7}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="light" style={styles.addButtonBlur}>
              <Ionicons name="add" size={24} color={colors.accentPrimary} />
            </BlurView>
          ) : (
            <View style={styles.addButtonAndroid}>
              <Ionicons name="add" size={24} color={colors.accentPrimary} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={20}
            tint="light"
            style={[styles.searchBlur, isSearchFocused && styles.searchFocused]}
          >
            <View style={styles.searchContent}>
              {renderSearchContent()}
            </View>
          </BlurView>
        ) : (
          <View style={[styles.searchAndroid, isSearchFocused && styles.searchFocused]}>
            {renderSearchContent()}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButtonAndroid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  searchWrapper: {
    borderRadius: spacing.inputRadius,
    overflow: 'hidden',
  },
  searchBlur: {
    borderRadius: spacing.inputRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    gap: spacing.s,
  },
  searchAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    gap: spacing.s,
  },
  searchFocused: {
    borderColor: colors.accentPrimary,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
});
