/**
 * Calendar Screen - Plan and track vehicle maintenances
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
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
import { useCalendar, useMaintenanceSchedules, CalendarMaintenance } from './hooks';
import { CalendarHeader } from './components/CalendarHeader';
import { CategoryFilter } from './components/CategoryFilter';
import { MonthView } from './components/MonthView';
import { DayEvents } from './components/DayEvents';
import { ScheduleForm } from './components/ScheduleForm';

export const CalendarScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarMaintenance | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    currentMonth,
    selectedDate,
    days,
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
  } = useCalendar();

  const {
    filteredSchedules,
    isLoading: isLoadingSchedules,
    categoryFilter,
    setCategoryFilter,
    getSchedulesForDate,
    refresh: refreshSchedules,
    addSchedule,
    completeSchedule,
    removeSchedule,
  } = useMaintenanceSchedules(vehicle?.id || null, vehicle?.current_mileage || undefined);

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

  const dayEvents = getSchedulesForDate(selectedDate);

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: spacing.tabBarHeight + spacing.xxxl + insets.bottom,
          },
        ]}
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
        {/* Header with navigation */}
        <CalendarHeader
          monthLabel={monthLabel}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onAddPress={handleAddPress}
          onTodayPress={goToToday}
        />

        {/* Category filter */}
        <CategoryFilter selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />

        {/* Month view calendar */}
        <MonthView days={days} schedules={filteredSchedules} onDayPress={selectDate} />

        {/* Day events */}
        {isLoadingSchedules ? (
          <View style={styles.loadingEvents}>
            <ActivityIndicator size="small" color={colors.accentPrimary} />
          </View>
        ) : (
          <DayEvents
            selectedDate={selectedDate}
            events={dayEvents}
            onAddPress={handleAddPress}
            onEventPress={handleEventPress}
            onCompleteEvent={handleCompleteEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </ScrollView>

      {/* Schedule form modal */}
      <ScheduleForm
        visible={showForm}
        vehicleId={vehicle.id}
        selectedDate={selectedDate}
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  loadingEvents: {
    padding: spacing.xxl,
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
