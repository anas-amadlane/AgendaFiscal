import { FiscalObligation } from '@/types/fiscal';

export interface NotificationSettings {
  enabled: boolean;
  alertDays: number[]; // J-15, J-7, J-3, J-1
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface NotificationData {
  id: string;
  obligationId: string;
  enterpriseId: string;
  title: string;
  message: string;
  dueDate: Date;
  daysRemaining: number;
  isRead: boolean;
  createdAt: Date;
  type: 'reminder' | 'overdue' | 'urgent';
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  alertDays: [15, 7, 3, 1],
  soundEnabled: true,
  vibrationEnabled: true,
  emailNotifications: false,
  pushNotifications: true,
};

export const calculateNotificationDate = (dueDate: Date, daysBefore: number): Date => {
  const notificationDate = new Date(dueDate);
  notificationDate.setDate(notificationDate.getDate() - daysBefore);
  return notificationDate;
};

export const shouldSendNotification = (
  obligation: FiscalObligation,
  settings: NotificationSettings,
  currentDate: Date = new Date()
): boolean => {
  if (!settings.enabled) return false;

  const daysRemaining = Math.ceil((obligation.dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));
  
  // Vérifier si on doit envoyer une notification aujourd'hui
  return settings.alertDays.includes(daysRemaining);
};

export const generateNotificationMessage = (
  obligation: FiscalObligation,
  enterpriseName: string,
  daysRemaining: number
): { title: string; message: string } => {
  let title = '';
  let message = '';

  if (daysRemaining < 0) {
    title = 'Obligation en retard';
    message = `L'obligation "${obligation.title}" pour ${enterpriseName} est en retard de ${Math.abs(daysRemaining)} jour(s).`;
  } else if (daysRemaining === 0) {
    title = 'Échéance aujourd\'hui';
    message = `L'obligation "${obligation.title}" pour ${enterpriseName} est due aujourd'hui.`;
  } else if (daysRemaining === 1) {
    title = 'Échéance demain';
    message = `L'obligation "${obligation.title}" pour ${enterpriseName} est due demain.`;
  } else {
    title = 'Rappel d\'échéance';
    message = `L'obligation "${obligation.title}" pour ${enterpriseName} est due dans ${daysRemaining} jour(s).`;
  }

  return { title, message };
};

export const scheduleNotification = async (
  obligation: FiscalObligation,
  enterpriseName: string,
  settings: NotificationSettings
): Promise<void> => {
  // Dans une vraie application, vous utiliseriez expo-notifications
  // pour programmer les notifications locales
  
  const currentDate = new Date();
  const daysRemaining = Math.ceil((obligation.dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

  if (shouldSendNotification(obligation, settings, currentDate)) {
    const { title, message } = generateNotificationMessage(obligation, enterpriseName, daysRemaining);
    
    // Simuler l'envoi de notification
    console.log('Notification programmée:', { title, message, obligationId: obligation.id });
    
    // Ici vous programmeriez la notification avec expo-notifications
    // await Notifications.scheduleNotificationAsync({
    //   content: { title, body: message },
    //   trigger: { date: new Date() }, // ou trigger spécifique
    // });
  }
};

export const sendImmediateNotification = async (
  obligation: FiscalObligation,
  enterpriseName: string,
  settings: NotificationSettings
): Promise<void> => {
  const daysRemaining = Math.ceil((obligation.dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const { title, message } = generateNotificationMessage(obligation, enterpriseName, daysRemaining);

  // Simuler l'envoi immédiat de notification
  console.log('Notification immédiate:', { title, message, obligationId: obligation.id });
  
  // Ici vous enverriez la notification immédiatement
  // await Notifications.scheduleNotificationAsync({
  //   content: { title, body: message },
  //   trigger: null, // notification immédiate
  // });
};

export const checkAndSendNotifications = async (
  obligations: FiscalObligation[],
  enterpriseNames: Record<string, string>,
  settings: NotificationSettings
): Promise<void> => {
  const currentDate = new Date();
  
  for (const obligation of obligations) {
    const enterpriseName = enterpriseNames[obligation.enterpriseId] || 'Entreprise inconnue';
    
    if (shouldSendNotification(obligation, settings, currentDate)) {
      await sendImmediateNotification(obligation, enterpriseName, settings);
    }
  }
};

