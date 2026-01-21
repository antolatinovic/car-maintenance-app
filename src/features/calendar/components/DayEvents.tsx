/**
 * List of maintenance events for a selected day
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';
import { MaintenanceCard } from './MaintenanceCard';
import { EmptyCalendar } from './EmptyCalendar';
import type { CalendarMaintenance } from '../hooks/useMaintenanceSchedules';

interface DayEventsProps {
  selectedDate: Date;
  events: CalendarMaintenance[];
  onAddPress?: () => void;
  onEventPress?: (event: CalendarMaintenance) => void;
  onCompleteEvent?: (eventId: string) => void;
  onDeleteEvent?: (eventId: string) => void;
}

export const DayEvents: React.FC<DayEventsProps> = ({
  selectedDate,
  events,
  onAddPress,
  onEventPress,
  onCompleteEvent,
  onDeleteEvent,
}) => {
  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

    // Capitalize first letter
    const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    if (isToday) {
      return `Aujourd'hui, ${dayDate}`;
    }

    return `${formattedDayName} ${dayDate}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateHeader}>{formatDateHeader(selectedDate)}</Text>
        {events.length > 0 && (
          <Text style={styles.eventCount}>
            {events.length} maintenance{events.length > 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.eventsList}>
        {events.length > 0 ? (
          events.map(event => (
            <MaintenanceCard
              key={event.id}
              id={event.id}
              title={event.description || ''}
              category={event.category}
              dueDate={event.due_date || undefined}
              dueMileage={event.due_mileage || undefined}
              urgency={event.urgency}
              estimatedCost={event.estimated_cost || undefined}
              location={event.location || undefined}
              onPress={() => onEventPress?.(event)}
              onComplete={() => onCompleteEvent?.(event.id)}
              onDelete={() => onDeleteEvent?.(event.id)}
            />
          ))
        ) : (
          <EmptyCalendar selectedDate={selectedDate} onAddPress={onAddPress} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  dateHeader: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  eventCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  eventsList: {
    gap: spacing.m,
    paddingBottom: spacing.xxl,
  },
});
