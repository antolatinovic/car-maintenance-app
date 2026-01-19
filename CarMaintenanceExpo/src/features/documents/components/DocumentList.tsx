/**
 * Document list component with FlatList
 */

import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { colors, spacing } from '@/core/theme';
import { DocumentCard } from './DocumentCard';
import { EmptyDocuments } from './EmptyDocuments';
import type { Document } from '@/core/types/database';

interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  hasFilters: boolean;
  onDocumentPress: (document: Document) => void;
  onDocumentLongPress?: (document: Document) => void;
  onRefresh: () => Promise<void>;
  onAddDocument: () => void;
  onClearFilters?: () => void;
  ListHeaderComponent?: React.ReactElement;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  hasFilters,
  onDocumentPress,
  onDocumentLongPress,
  onRefresh,
  onAddDocument,
  onClearFilters,
  ListHeaderComponent,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Document }) => (
    <DocumentCard document={item} onPress={onDocumentPress} onLongPress={onDocumentLongPress} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyDocuments
        hasFilters={hasFilters}
        onAddDocument={onAddDocument}
        onClearFilters={onClearFilters}
      />
    );
  };

  return (
    <FlatList
      data={documents}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={[styles.container, documents.length === 0 && styles.emptyContainer]}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={<View style={styles.footer} />}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.accentPrimary}
          colors={[colors.accentPrimary]}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.s,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  footer: {
    height: spacing.tabBarHeight + spacing.xl,
  },
});
