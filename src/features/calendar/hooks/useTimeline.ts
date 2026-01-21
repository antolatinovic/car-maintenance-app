/**
 * Hook for grouping maintenance events into timeline sections
 */

import { useMemo } from 'react';
import type { CalendarMaintenance } from './useMaintenanceSchedules';
import type { SectionType } from '../components/TimelineSectionHeader';

export interface TimelineSection {
  key: string;
  title: string;
  type: SectionType;
  data: CalendarMaintenance[];
}

export interface UseTimelineResult {
  sections: TimelineSection[];
  totalCount: number;
}

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const formatDateWithDay = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${date.getMonth()}`;
};

export const useTimeline = (schedules: CalendarMaintenance[]): UseTimelineResult => {
  const sections = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sort schedules by date
    const sortedSchedules = [...schedules].sort((a, b) => {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      return dateA - dateB;
    });

    // Group by section
    const overdue: CalendarMaintenance[] = [];
    const todayEvents: CalendarMaintenance[] = [];
    const tomorrowEvents: CalendarMaintenance[] = [];
    const futureByMonth: Record<string, CalendarMaintenance[]> = {};

    sortedSchedules.forEach(schedule => {
      if (!schedule.due_date) {
        // Events without date go to upcoming/future
        const monthKey = getMonthKey(now);
        if (!futureByMonth[monthKey]) {
          futureByMonth[monthKey] = [];
        }
        futureByMonth[monthKey].push(schedule);
        return;
      }

      const dueDate = new Date(schedule.due_date);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDateOnly < today) {
        overdue.push(schedule);
      } else if (isSameDay(dueDateOnly, today)) {
        todayEvents.push(schedule);
      } else if (isSameDay(dueDateOnly, tomorrow)) {
        tomorrowEvents.push(schedule);
      } else {
        // Group by month for future events
        const monthKey = getMonthKey(dueDate);
        if (!futureByMonth[monthKey]) {
          futureByMonth[monthKey] = [];
        }
        futureByMonth[monthKey].push(schedule);
      }
    });

    // Build sections array
    const result: TimelineSection[] = [];

    if (overdue.length > 0) {
      result.push({
        key: 'overdue',
        title: 'En retard',
        type: 'overdue',
        data: overdue,
      });
    }

    if (todayEvents.length > 0) {
      result.push({
        key: 'today',
        title: `Aujourd'hui, ${formatDateWithDay(today).replace(/^./, c => c.toUpperCase())}`,
        type: 'today',
        data: todayEvents,
      });
    }

    if (tomorrowEvents.length > 0) {
      result.push({
        key: 'tomorrow',
        title: `Demain, ${formatDateWithDay(tomorrow).replace(/^./, c => c.toUpperCase())}`,
        type: 'tomorrow',
        data: tomorrowEvents,
      });
    }

    // Add future months sorted chronologically
    const sortedMonthKeys = Object.keys(futureByMonth).sort();
    sortedMonthKeys.forEach(monthKey => {
      const events = futureByMonth[monthKey];
      if (events.length > 0) {
        // Parse the month key to get a display date
        const [year, month] = monthKey.split('-').map(Number);
        const monthDate = new Date(year, month, 1);
        const monthTitle = formatMonthYear(monthDate);

        result.push({
          key: monthKey,
          title: monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1),
          type: 'future',
          data: events,
        });
      }
    });

    return result;
  }, [schedules]);

  const totalCount = schedules.length;

  return { sections, totalCount };
};
