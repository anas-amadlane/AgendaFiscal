import { FiscalCalendarEntry, getFiscalCalendarEntryStatus } from '@/types/fiscal';

// Notification settings interface for user preferences
export interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  reminderDays: number;
}

// Default notification settings
export const defaultNotificationSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  soundEnabled: true,
  reminderDays: 7
};

export interface Notification {
  id: string;
  fiscalEntryId: number;
  title: string;
  message: string;
  type: 'overdue' | 'due' | 'reminder';
  isRead: boolean;
  createdAt: Date;
}

// Generate notifications for fiscal calendar entries
export const generateFiscalCalendarNotifications = (entries: FiscalCalendarEntry[]): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date();

  entries.forEach(entry => {
    const status = getFiscalCalendarEntryStatus(entry, now);
    
    if (status === 'overdue') {
      notifications.push({
        id: `overdue-${entry.id}`,
        fiscalEntryId: entry.id,
        title: 'Déclaration en retard',
        message: `${entry.detail_declaration} - ${entry.categorie_personnes} (${entry.tag})`,
        type: 'overdue',
        isRead: false,
        createdAt: now
      });
    } else if (status === 'due') {
      notifications.push({
        id: `due-${entry.id}`,
        fiscalEntryId: entry.id,
        title: 'Échéance proche',
        message: `${entry.detail_declaration} - ${entry.categorie_personnes} (${entry.tag})`,
        type: 'due',
        isRead: false,
        createdAt: now
      });
    }
  });

  return notifications;
};

// Get unread notifications count
export const getUnreadNotificationsCount = (notifications: Notification[]): number => {
  return notifications.filter(notification => !notification.isRead).length;
};

// Mark notification as read
export const markNotificationAsRead = (notifications: Notification[], notificationId: string): Notification[] => {
  return notifications.map(notification => 
    notification.id === notificationId 
      ? { ...notification, isRead: true }
      : notification
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (notifications: Notification[]): Notification[] => {
  return notifications.map(notification => ({ ...notification, isRead: true }));
};

// Filter notifications by type
export const filterNotificationsByType = (notifications: Notification[], type: 'overdue' | 'due' | 'reminder'): Notification[] => {
  return notifications.filter(notification => notification.type === type);
};

// Get overdue notifications
export const getOverdueNotifications = (notifications: Notification[]): Notification[] => {
  return filterNotificationsByType(notifications, 'overdue');
};

// Get due notifications
export const getDueNotifications = (notifications: Notification[]): Notification[] => {
  return filterNotificationsByType(notifications, 'due');
};

// Get reminder notifications
export const getReminderNotifications = (notifications: Notification[]): Notification[] => {
  return filterNotificationsByType(notifications, 'reminder');
};

// Sort notifications by priority and date
export const sortNotificationsByPriority = (notifications: Notification[]): Notification[] => {
  return notifications.sort((a, b) => {
    // Priority order: overdue > due > reminder
    const priorityOrder = { overdue: 3, due: 2, reminder: 1 };
    const priorityDiff = priorityOrder[b.type] - priorityOrder[a.type];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    // If same priority, sort by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};

// Get notifications summary
export const getNotificationsSummary = (notifications: Notification[]) => {
  const total = notifications.length;
  const unread = getUnreadNotificationsCount(notifications);
  const overdue = getOverdueNotifications(notifications).length;
  const due = getDueNotifications(notifications).length;
  const reminders = getReminderNotifications(notifications).length;

  return {
    total,
    unread,
    overdue,
    due,
    reminders
  };
};

