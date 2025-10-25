import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
}

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  async scheduleReminder(reminder: MedicineReminder): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medicine Reminder',
        body: `Time to take ${reminder.medicineName} (${reminder.dosage})`,
        data: {
          medicineId: reminder.id,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    return notificationId;
  }

  async scheduleMultipleReminders(reminders: MedicineReminder[]): Promise<string[]> {
    const notificationIds: string[] = [];
    
    for (const reminder of reminders) {
      try {
        const id = await this.scheduleReminder(reminder);
        notificationIds.push(id);
      } catch (error) {
        console.error('Failed to schedule reminder:', error);
      }
    }
    
    return notificationIds;
  }

  async cancelReminder(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getAllScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Schedule a one-time reminder for a specific date and time
  async scheduleOneTimeReminder(
    title: string,
    body: string,
    date: Date,
    data?: any
  ): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date,
      },
    });

    return notificationId;
  }

  // Schedule a reminder for medicine refill
  async scheduleRefillReminder(
    medicineName: string,
    daysLeft: number
  ): Promise<string> {
    const refillDate = new Date();
    refillDate.setDate(refillDate.getDate() + daysLeft);
    refillDate.setHours(9, 0, 0, 0); // 9 AM

    return await this.scheduleOneTimeReminder(
      '🔄 Medicine Refill Reminder',
      `Your ${medicineName} is running low. Consider refilling soon.`,
      refillDate,
      { type: 'refill', medicineName }
    );
  }

  // Schedule a reminder for doctor appointment
  async scheduleDoctorReminder(
    doctorName: string,
    appointmentDate: Date
  ): Promise<string> {
    // Reminder 1 day before
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(18, 0, 0, 0); // 6 PM day before

    return await this.scheduleOneTimeReminder(
      '👨‍⚕️ Doctor Appointment Reminder',
      `You have an appointment with Dr. ${doctorName} tomorrow.`,
      reminderDate,
      { type: 'appointment', doctorName, appointmentDate: appointmentDate.toISOString() }
    );
  }

  // Handle notification response (when user taps on notification)
  setupNotificationResponseHandler() {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data?.type === 'medicine') {
        // Navigate to medicine details or mark as taken
        console.log('Medicine reminder tapped:', data);
      } else if (data?.type === 'refill') {
        // Navigate to medicine refill page
        console.log('Refill reminder tapped:', data);
      } else if (data?.type === 'appointment') {
        // Navigate to appointments page
        console.log('Appointment reminder tapped:', data);
      }
    });
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    scheduled: number;
    delivered: number;
  }> {
    const scheduled = await this.getAllScheduledReminders();
    
    return {
      scheduled: scheduled.length,
      delivered: 0, // This would need to be tracked separately
    };
  }
}

export const notificationService = new NotificationService();

// Utility functions for common reminder patterns
export const createDailyReminders = (
  medicineName: string,
  dosage: string,
  times: string[]
): MedicineReminder[] => {
  return times.map((time, index) => ({
    id: `${medicineName.toLowerCase().replace(/\s+/g, '_')}_${index}`,
    medicineName,
    dosage,
    time,
    frequency: 'daily',
  }));
};

export const createWeeklyReminder = (
  medicineName: string,
  dosage: string,
  time: string,
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
): MedicineReminder => ({
  id: `${medicineName.toLowerCase().replace(/\s+/g, '_')}_weekly_${dayOfWeek}`,
  medicineName,
  dosage,
  time,
  frequency: 'weekly',
});

// Predefined reminder templates
export const reminderTemplates = {
  twiceDaily: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['08:00', '20:00']),
  
  threeTimesDaily: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['08:00', '14:00', '20:00']),
  
  fourTimesDaily: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['08:00', '12:00', '16:00', '20:00']),
  
  beforeMeals: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['07:30', '12:30', '19:30']),
  
  afterMeals: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['08:30', '13:30', '20:30']),
  
  bedtime: (medicineName: string, dosage: string) =>
    createDailyReminders(medicineName, dosage, ['22:00']),
};