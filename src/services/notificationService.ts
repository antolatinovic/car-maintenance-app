/**
 * Notification Service - Push notification management
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MaintenanceSchedule, MaintenanceCategory } from '@/core/types/database';

const NOTIFICATION_IDS_KEY = '@notification_ids';

interface NotificationIds {
  [maintenanceId: string]: string[];
}

const CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
  oil_change: 'Vidange',
  brakes: 'Freins',
  filters: 'Filtres',
  tires: 'Pneus',
  mechanical: 'Mecanique',
  revision: 'Revision',
  ac: 'Climatisation',
  distribution: 'Distribution',
  suspension: 'Amortisseur',
  fluids: 'Liquides',
  gearbox_oil: 'Vidange boite auto',
  custom: 'Entretien',
};

/**
 * Configure default notification behavior
 */
export const configureNotifications = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Request notification permissions
 * @returns true if permissions granted, false otherwise
 */
export const requestPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    // Notifications require a physical device - silently return false in simulator
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    // Permission not granted - silently return false
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Rappels de maintenance',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }

  return true;
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

/**
 * Get the Expo push token for remote notifications (future use)
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'car-maintenance',
    });
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Load stored notification IDs from AsyncStorage
 */
const loadNotificationIds = async (): Promise<NotificationIds> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

/**
 * Save notification IDs to AsyncStorage
 */
const saveNotificationIds = async (ids: NotificationIds): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving notification IDs:', error);
  }
};

/**
 * Schedule a local notification
 */
const scheduleLocalNotification = async (
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, unknown>
): Promise<string | null> => {
  if (triggerDate <= new Date()) {
    return null;
  }

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'maintenance' : undefined,
      },
    });
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

/**
 * Schedule notifications for a maintenance item
 * Creates J-7, J-1, and J+1 (if overdue) reminders
 */
export const scheduleMaintenanceNotifications = async (
  maintenance: MaintenanceSchedule
): Promise<void> => {
  if (!maintenance.due_date) {
    return;
  }

  const notificationIds = await loadNotificationIds();
  const existingIds = notificationIds[maintenance.id] || [];

  // Cancel existing notifications for this maintenance
  for (const id of existingIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  const newIds: string[] = [];
  const dueDate = new Date(maintenance.due_date);
  const now = new Date();

  const title = maintenance.description || CATEGORY_LABELS[maintenance.category];
  const data = {
    maintenanceId: maintenance.id,
    vehicleId: maintenance.vehicle_id,
    type: 'maintenance_reminder',
  };

  // J-7 reminder (7 days before)
  const sevenDaysBefore = new Date(dueDate);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
  sevenDaysBefore.setHours(9, 0, 0, 0);

  if (sevenDaysBefore > now) {
    const id = await scheduleLocalNotification(
      `🔧 ${title} prevu dans 7 jours`,
      `Pensez a planifier votre ${title.toLowerCase()}.`,
      sevenDaysBefore,
      { ...data, reminderType: 'J-7' }
    );
    if (id) newIds.push(id);
  }

  // J-1 reminder (1 day before)
  const oneDayBefore = new Date(dueDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  oneDayBefore.setHours(9, 0, 0, 0);

  if (oneDayBefore > now) {
    const id = await scheduleLocalNotification(
      `⚠️ ${title} prevu demain !`,
      `N'oubliez pas votre ${title.toLowerCase()} demain.`,
      oneDayBefore,
      { ...data, reminderType: 'J-1' }
    );
    if (id) newIds.push(id);
  }

  // J+1 reminder (1 day after - overdue)
  const oneDayAfter = new Date(dueDate);
  oneDayAfter.setDate(oneDayAfter.getDate() + 1);
  oneDayAfter.setHours(9, 0, 0, 0);

  if (oneDayAfter > now) {
    const id = await scheduleLocalNotification(
      `🚨 ${title} en retard !`,
      `Votre ${title.toLowerCase()} est en retard d'1 jour.`,
      oneDayAfter,
      { ...data, reminderType: 'J+1' }
    );
    if (id) newIds.push(id);
  }

  // Save the new notification IDs
  notificationIds[maintenance.id] = newIds;
  await saveNotificationIds(notificationIds);
};

/**
 * Cancel all notifications for a maintenance item
 */
export const cancelMaintenanceNotifications = async (maintenanceId: string): Promise<void> => {
  const notificationIds = await loadNotificationIds();
  const ids = notificationIds[maintenanceId] || [];

  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  delete notificationIds[maintenanceId];
  await saveNotificationIds(notificationIds);
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getScheduledNotifications = async (): Promise<
  Notifications.NotificationRequest[]
> => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

/**
 * Schedule notifications for all pending maintenances
 */
export const scheduleAllMaintenanceNotifications = async (
  maintenances: MaintenanceSchedule[]
): Promise<void> => {
  for (const maintenance of maintenances) {
    if (maintenance.status === 'pending' && maintenance.due_date) {
      await scheduleMaintenanceNotifications(maintenance);
    }
  }
};
