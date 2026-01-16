/**
 * Hook for calendar navigation and date selection
 */

import { useState, useCallback, useMemo } from 'react';

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface UseCalendarResult {
  currentMonth: Date;
  selectedDate: Date;
  days: CalendarDay[];
  monthLabel: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  selectDate: (date: Date) => void;
}

const DAYS_IN_WEEK = 7;

const getMonthLabel = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

const isSameMonth = (date1: Date, date2: Date): boolean => {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

const getCalendarDays = (month: Date, selectedDate: Date): CalendarDay[] => {
  const today = new Date();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  // First day of the month
  const firstDay = new Date(year, monthIndex, 1);
  // Last day of the month
  const lastDay = new Date(year, monthIndex + 1, 0);

  // Day of week for first day (0 = Sunday, adjust to Monday = 0)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6; // Sunday becomes 6

  const days: CalendarDay[] = [];

  // Add days from previous month
  const prevMonth = new Date(year, monthIndex, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, monthIndex - 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
    });
  }

  // Add days from current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, monthIndex, day);
    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
    });
  }

  // Add days from next month to complete the grid (6 rows)
  const remainingDays = DAYS_IN_WEEK * 6 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, monthIndex + 1, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selectedDate),
    });
  }

  return days;
};

export const useCalendar = (initialDate?: Date): UseCalendarResult => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialDate ? new Date(initialDate.getFullYear(), initialDate.getMonth(), 1) : today
  );
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || today);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }, []);

  const selectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      // If selecting a date from different month, navigate to that month
      if (!isSameMonth(date, currentMonth)) {
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }
    },
    [currentMonth]
  );

  const days = useMemo(
    () => getCalendarDays(currentMonth, selectedDate),
    [currentMonth, selectedDate]
  );

  const monthLabel = useMemo(() => getMonthLabel(currentMonth), [currentMonth]);

  return {
    currentMonth,
    selectedDate,
    days,
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
  };
};
