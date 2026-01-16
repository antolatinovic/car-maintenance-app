/**
 * Monthly calendar grid view with maintenance indicators
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/core/theme';
import type { CalendarDay } from '../hooks/useCalendar';
import type { CalendarMaintenance, UrgencyLevel } from '../hooks/useMaintenanceSchedules';

interface MonthViewProps {
  days: CalendarDay[];
  schedules: CalendarMaintenance[];
  onDayPress: (date: Date) => void;
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const urgencyColors: Record<UrgencyLevel, string> = {
  overdue: colors.accentDanger,
  soon: colors.accentWarning,
  upcoming: colors.accentSuccess,
};

interface DayIndicators {
  hasSchedules: boolean;
  highestUrgency?: UrgencyLevel;
}

export const MonthView: React.FC<MonthViewProps> = ({ days, schedules, onDayPress }) => {
  // Build a map of date -> indicator info
  const dateIndicators = useMemo(() => {
    const indicators = new Map<string, DayIndicators>();

    schedules.forEach(schedule => {
      if (!schedule.due_date) return;
      const dateKey = schedule.due_date.split('T')[0];

      const existing = indicators.get(dateKey);
      if (!existing) {
        indicators.set(dateKey, {
          hasSchedules: true,
          highestUrgency: schedule.urgency,
        });
      } else {
        // Update to higher urgency if needed
        const urgencyOrder: UrgencyLevel[] = ['upcoming', 'soon', 'overdue'];
        const existingIndex = urgencyOrder.indexOf(existing.highestUrgency || 'upcoming');
        const newIndex = urgencyOrder.indexOf(schedule.urgency);
        if (newIndex > existingIndex) {
          existing.highestUrgency = schedule.urgency;
        }
      }
    });

    return indicators;
  }, [schedules]);

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const renderDay = (day: CalendarDay, index: number) => {
    const dateKey = formatDateKey(day.date);
    const indicator = dateIndicators.get(dateKey);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          day.isSelected && styles.selectedDay,
          day.isToday && !day.isSelected && styles.todayDay,
        ]}
        onPress={() => onDayPress(day.date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayText,
            !day.isCurrentMonth && styles.otherMonthText,
            day.isSelected && styles.selectedDayText,
            day.isToday && !day.isSelected && styles.todayText,
          ]}
        >
          {day.day}
        </Text>

        {indicator?.hasSchedules && (
          <View
            style={[
              styles.indicator,
              { backgroundColor: urgencyColors[indicator.highestUrgency || 'upcoming'] },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>{days.map((day, index) => renderDay(day, index))}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.s,
  },
  weekdayText: {
    ...typography.smallMedium,
    color: colors.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  otherMonthText: {
    color: colors.textTertiary,
  },
  selectedDay: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
  },
  selectedDayText: {
    color: colors.textOnColor,
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 20,
  },
  todayText: {
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
