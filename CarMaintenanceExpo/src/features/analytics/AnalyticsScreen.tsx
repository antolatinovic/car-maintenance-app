/**
 * Analytics Screen - Dashboard with charts and statistics
 */

import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/core/theme';
import { useAnalyticsData } from './hooks';
import {
  AnalyticsHeader,
  ExpenseTrendChart,
  CategoryPieChart,
  CostPerKmCard,
  MileageLineChart,
  EmptyAnalytics,
} from './components';

interface AnalyticsScreenProps {
  onClose: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { data, selectedYear, availableYears, isLoading, error, setSelectedYear, refresh } =
    useAnalyticsData();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <AnalyticsHeader
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearChange={setSelectedYear}
          onClose={onClose}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <AnalyticsHeader
          selectedYear={selectedYear}
          availableYears={availableYears}
          onYearChange={setSelectedYear}
          onClose={onClose}
        />
        <EmptyAnalytics message={error || 'Aucune donnee disponible'} />
      </View>
    );
  }

  const hasData = data.yearTotal > 0;

  return (
    <View style={styles.container}>
      <AnalyticsHeader
        selectedYear={selectedYear}
        availableYears={availableYears}
        onYearChange={setSelectedYear}
        onClose={onClose}
      />

      {!hasData ? (
        <EmptyAnalytics />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.accentPrimary}
              colors={[colors.accentPrimary]}
            />
          }
        >
          {/* Cost Per Km Card */}
          <View style={styles.section}>
            <CostPerKmCard data={data.costPerKm} />
          </View>

          {/* Monthly Expenses Bar Chart */}
          <View style={styles.section}>
            <ExpenseTrendChart data={data.yearlySummary} selectedYear={selectedYear} />
          </View>

          {/* Category Breakdown Pie Chart */}
          <View style={styles.section}>
            <CategoryPieChart data={data.categoryBreakdown} total={data.yearTotal} />
          </View>

          {/* Mileage Evolution Line Chart */}
          <View style={styles.section}>
            <MileageLineChart data={data.mileageHistory} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: spacing.m,
  },
  section: {
    marginBottom: spacing.l,
  },
});
