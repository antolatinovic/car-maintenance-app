/**
 * Expense list component with FlatList
 */

import React from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { colors, spacing } from '@/core/theme';
import { ExpenseCard } from './ExpenseCard';
import { EmptyExpenses } from './EmptyExpenses';
import type { Expense } from '@/core/types/database';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  hasFilters: boolean;
  onExpensePress: (expense: Expense) => void;
  onExpenseLongPress?: (expense: Expense) => void;
  onRefresh: () => Promise<void>;
  onAddExpense: () => void;
  onClearFilters?: () => void;
  ListHeaderComponent?: React.ReactElement;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading,
  hasFilters,
  onExpensePress,
  onExpenseLongPress,
  onRefresh,
  onAddExpense,
  onClearFilters,
  ListHeaderComponent,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseCard expense={item} onPress={onExpensePress} onLongPress={onExpenseLongPress} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyExpenses
        hasFilters={hasFilters}
        onAddExpense={onAddExpense}
        onClearFilters={onClearFilters}
      />
    );
  };

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={[styles.container, expenses.length === 0 && styles.emptyContainer]}
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
