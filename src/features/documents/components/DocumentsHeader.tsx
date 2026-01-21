/**
 * Documents screen header with search
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.m }]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Documents</Text>
          <Text style={styles.subtitle}>
            {documentCount} document{documentCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add" size={24} color={colors.textOnColor} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.s,
  },
  searchContainerFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.cardBackground,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
});
