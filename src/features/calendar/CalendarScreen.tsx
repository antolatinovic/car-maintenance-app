/**
 * Calendar Screen - Chronological timeline of vehicle maintenances
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/core/theme';
import { getPrimaryVehicle } from '@/services/vehicleService';
import type { Vehicle } from '@/core/types/database';
import { useMaintenanceSchedules, useTimeline, CalendarMaintenance, TimelineSection } from './hooks';
import { TimelineHeader } from './components/TimelineHeader';
import { TimelineSectionHeader } from './components/TimelineSectionHeader';
import { TimelineEventRow } from './components/TimelineEventRow';
import { EmptyTimeline } from './components/EmptyTimeline';
import { CategoryFilter } from './components/CategoryFilter';
import { ScheduleForm } from './components/ScheduleForm';

export const CalendarScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarMaintenance | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    filteredSchedules,
    isLoading: isLoadingSchedules,
    categoryFilter,
    setCategoryFilter,
    refresh: refreshSchedules,
    addSchedule,
    completeSchedule,
    removeSchedule,
  } = useMaintenanceSchedules(vehicle?.id || null, vehicle?.current_mileage || undefined);

  const { sections, totalCount } = useTimeline(filteredSchedules);

  // Fetch primary vehicle on mount
  useEffect(() => {
    const fetchVehicle = async () => {
      setIsLoadingVehicle(true);
      try {
        const result = await getPrimaryVehicle();
        if (result.data) {
          setVehicle(result.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
      } finally {
        setIsLoadingVehicle(false);
      }
    };

    fetchVehicle();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshSchedules();
    setRefreshing(false);
  }, [refreshSchedules]);

  const handleAddPress = useCallback(() => {
    setSelectedEvent(null);
    setShowForm(true);
  }, []);

  const handleEventPress = useCallback((event: CalendarMaintenance) => {
    setSelectedEvent(event);
    setShowForm(true);
  }, []);

  const handleCompleteEvent = useCallback(
    async (eventId: string) => {
      Alert.alert(
        'Marquer comme termine',
        'Voulez-vous marquer cette maintenance comme terminee?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: async () => {
              const success = await completeSchedule(eventId);
              if (!success) {
                Alert.alert('Erreur', 'Impossible de marquer la maintenance comme terminee');
              }
            },
          },
        ]
      );
    },
    [completeSchedule]
  );

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer cette maintenance planifiee?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await removeSchedule(eventId);
            if (!success) {
              Alert.alert('Erreur', 'Impossible de supprimer la maintenance');
            }
          },
        },
      ]);
    },
    [removeSchedule]
  );

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setSelectedEvent(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: Parameters<typeof addSchedule>[0]) => {
      const success = await addSchedule(data);
      if (success) {
        setShowForm(false);
        setSelectedEvent(null);
      } else {
        Alert.alert('Erreur', "Impossible d'ajouter la maintenance");
      }
    },
    [addSchedule]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: TimelineSection }) => (
      <TimelineSectionHeader title={section.title} count={section.data.length} type={section.type} />
    ),
    []
  );

  const renderItem = useCallback(
    ({
      item,
      index,
      section,
    }: {
      item: CalendarMaintenance;
      index: number;
      section: TimelineSection;
    }) => (
      <TimelineEventRow
        event={item}
        isFirst={index === 0}
        isLast={index === section.data.length - 1}
        onPress={() => handleEventPress(item)}
        onComplete={() => handleCompleteEvent(item.id)}
        onDelete={() => handleDeleteEvent(item.id)}
      />
    ),
    [handleEventPress, handleCompleteEvent, handleDeleteEvent]
  );

  const renderListHeader = useCallback(
    () => (
      <>
        <TimelineHeader count={totalCount} onAddPress={handleAddPress} />
        <CategoryFilter selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />
      </>
    ),
    [totalCount, handleAddPress, categoryFilter, setCategoryFilter]
  );

  const renderEmptyComponent = useCallback(() => {
    if (isLoadingSchedules) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accentPrimary} />
        </View>
      );
    }
    return <EmptyTimeline onAddPress={handleAddPress} />;
  }, [isLoadingSchedules, handleAddPress]);

  // Loading state
  if (isLoadingVehicle) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </View>
    );
  }

  // No vehicle state
  if (!vehicle) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
        <View style={[styles.emptyState, { paddingTop: insets.top + spacing.xxxl }]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="car-sport" size={48} color={colors.accentPrimary} />
          </View>
          <Text style={styles.emptyTitle}>Aucun vehicule</Text>
          <Text style={styles.emptyDescription}>
            Ajoutez un vehicule pour planifier ses maintenances
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: spacing.tabBarHeight + spacing.xxxl + insets.bottom,
          },
          sections.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        }
      />

      {/* Schedule form modal */}
      <ScheduleForm
        visible={showForm}
        vehicleId={vehicle.id}
        selectedDate={new Date()}
        editingSchedule={selectedEvent}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
  },
  emptyContent: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.xxxl * 2,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.accentPrimary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});
