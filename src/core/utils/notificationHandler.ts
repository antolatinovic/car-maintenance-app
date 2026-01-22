/**
 * Notification Handler - Handles notification interactions
 */

import * as Notifications from 'expo-notifications';
import type { TabItem } from '@/shared/components';

interface NotificationData {
  maintenanceId?: string;
  vehicleId?: string;
  type?: string;
  reminderType?: string;
}

type NavigateToTabFunction = (tab: TabItem) => void;

let navigateToTab: NavigateToTabFunction | null = null;
let highlightedMaintenanceId: string | null = null;

/**
 * Set the navigation function (called from App.tsx)
 */
export const setNavigationHandler = (handler: NavigateToTabFunction): void => {
  navigateToTab = handler;
};

/**
 * Get the currently highlighted maintenance ID (for calendar highlight)
 */
export const getHighlightedMaintenanceId = (): string | null => {
  return highlightedMaintenanceId;
};

/**
 * Clear the highlighted maintenance ID
 */
export const clearHighlightedMaintenance = (): void => {
  highlightedMaintenanceId = null;
};

/**
 * Handle notification response (when user taps on notification)
 */
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse
): void => {
  const data = response.notification.request.content.data as NotificationData;

  if (data.type === 'maintenance_reminder' && data.maintenanceId) {
    highlightedMaintenanceId = data.maintenanceId;

    if (navigateToTab) {
      navigateToTab('calendar');
    }
  }
};

/**
 * Create the notification response listener
 */
export const createNotificationResponseListener = (): Notifications.EventSubscription => {
  return Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
};

/**
 * Create listener for notifications received while app is in foreground
 */
export const createNotificationReceivedListener = (
  callback?: (notification: Notifications.Notification) => void
): Notifications.EventSubscription => {
  return Notifications.addNotificationReceivedListener(notification => {
    if (callback) {
      callback(notification);
    }
  });
};
