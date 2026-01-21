/**
 * Picker Modal Component
 * Searchable list modal for selecting makes or models
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { spacing } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';

interface PickerModalProps<T> {
  visible: boolean;
  title: string;
  searchPlaceholder: string;
  data: T[];
  selectedId?: string;
  keyExtractor: (item: T) => string;
  labelExtractor: (item: T) => string;
  subtitleExtractor?: (item: T) => string | undefined;
  filterFn: (item: T, query: string) => boolean;
  onSelect: (item: T) => void;
  onClose: () => void;
  onManualEntry?: () => void;
  manualEntryLabel?: string;
}

export function PickerModal<T>({
  visible,
  title,
  searchPlaceholder,
  data,
  selectedId,
  keyExtractor,
  labelExtractor,
  subtitleExtractor,
  filterFn,
  onSelect,
  onClose,
  onManualEntry,
  manualEntryLabel,
}: PickerModalProps<T>): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    return data.filter(item => filterFn(item, searchQuery));
  }, [data, searchQuery, filterFn]);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (item: T) => {
      setSearchQuery('');
      onSelect(item);
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: { item: T }) => {
      const id = keyExtractor(item);
      const isSelected = id === selectedId;
      const label = labelExtractor(item);
      const subtitle = subtitleExtractor?.(item);

      return (
        <TouchableOpacity
          style={[styles.listItem, isSelected && styles.listItemSelected]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.listItemText, isSelected && styles.listItemTextSelected]}>
            {label}
          </Text>
          {subtitle && <Text style={styles.listItemSubtext}>{subtitle}</Text>}
        </TouchableOpacity>
      );
    },
    [keyExtractor, selectedId, labelExtractor, subtitleExtractor, handleSelect]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
      <Text style={styles.emptyText}>Aucun resultat trouve</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.textTertiary}
            autoFocus
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={30}
          windowSize={10}
        />

        {/* Manual Entry Footer */}
        {onManualEntry && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.m }]}>
            <TouchableOpacity onPress={onManualEntry} activeOpacity={0.7}>
              <Text style={styles.manualEntryLink}>
                {manualEntryLabel || 'Saisie manuelle'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSpacer: {
    width: 28,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: spacing.inputRadius,
    marginHorizontal: spacing.screenPaddingHorizontal,
    marginVertical: spacing.m,
    paddingHorizontal: spacing.m,
    height: spacing.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    ...typography.body,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    borderRadius: spacing.cardRadiusSmall,
    marginBottom: spacing.xs,
  },
  listItemSelected: {
    backgroundColor: colors.accentPrimary + '15',
  },
  listItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  listItemTextSelected: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  listItemSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: spacing.m,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  manualEntryLink: {
    ...typography.caption,
    color: colors.accentPrimary,
    textDecorationLine: 'underline',
  },
});
