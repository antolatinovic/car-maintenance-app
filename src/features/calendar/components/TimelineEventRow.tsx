/**
 * Timeline event row with visual connector (line + colored dot)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/core/theme';
import { MaintenanceCard } from './MaintenanceCard';
import type { CalendarMaintenance, UrgencyLevel } from '../hooks/useMaintenanceSchedules';

interface TimelineEventRowProps {
  event: CalendarMaintenance;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

const urgencyColors: Record<UrgencyLevel, string> = {
  overdue: colors.accentDanger,
  soon: colors.accentWarning,
  upcoming: colors.accentSuccess,
};

export const TimelineEventRow: React.FC<TimelineEventRowProps> = ({
  event,
  isFirst,
  isLast,
  onPress,
  onComplete,
  onDelete,
}) => {
  const dotColor = urgencyColors[event.urgency];

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.connector}>
        {/* Top line segment */}
        {!isFirst && <View style={styles.lineTop} />}

        {/* Colored dot */}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />

        {/* Bottom line segment */}
        {!isLast && <View style={styles.lineBottom} />}
      </View>

      {/* Card content */}
      <View style={styles.cardContainer}>
        <MaintenanceCard
          id={event.id}
          title={event.description || ''}
          category={event.category}
          dueDate={event.due_date || undefined}
          dueMileage={event.due_mileage || undefined}
          urgency={event.urgency}
          estimatedCost={event.estimated_cost || undefined}
          location={event.location || undefined}
          onPress={onPress}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      </View>
    </View>
  );
};

const DOT_SIZE = 12;
const LINE_WIDTH = 2;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: spacing.s,
  },
  connector: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.m,
  },
  lineTop: {
    width: LINE_WIDTH,
    flex: 1,
    backgroundColor: colors.border,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginVertical: spacing.xs,
  },
  lineBottom: {
    width: LINE_WIDTH,
    flex: 1,
    backgroundColor: colors.border,
  },
  cardContainer: {
    flex: 1,
  },
});
