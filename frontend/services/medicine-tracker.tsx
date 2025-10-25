import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

interface MedicineSchedule {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  date: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  takenAt?: string;
  notificationId?: string;
}

class MedicineTracker {
  private readonly SCHEDULES_KEY = 'medicine_schedules';
  private readonly MISSED_THRESHOLD = 30; // minutes after scheduled time

  async createSchedule(
    medicineId: string,
    medicineName: string,
    dosage: string,
    times: string[]
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const schedules: MedicineSchedule[] = [];

    for (const time of times) {
      const schedule: MedicineSchedule = {
        id: `${medicineId}_${time}_${today}`,
        medicineId,
        medicineName,
        dosage,
        scheduledTime: time,
        date: today,
        status: 'pending',
      };

      // Schedule notification
      const notificationId = await this.scheduleNotification(schedule);
      schedule.notificationId = notificationId;
      
      schedules.push(schedule);
    }

    await this.saveSchedules(schedules);
  }

  async markAsTaken(scheduleId: string): Promise<void> {
    const schedules = await this.getAllSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (schedule) {
      schedule.status = 'taken';
      schedule.takenAt = new Date().toISOString();
      
      // Cancel notification
      if (schedule.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(schedule.notificationId);
      }
      
      await this.updateSchedule(schedule);
    }
  }

  async markAsSkipped(scheduleId: string): Promise<void> {
    const schedules = await this.getAllSchedules();
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (schedule) {
      schedule.status = 'skipped';
      
      // Cancel notification
      if (schedule.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(schedule.notificationId);
      }
      
      await this.updateSchedule(schedule);
    }
  }

  async checkMissedDoses(): Promise<MedicineSchedule[]> {
    const schedules = await this.getAllSchedules();
    const now = new Date();
    const missedSchedules: MedicineSchedule[] = [];

    for (const schedule of schedules) {
      if (schedule.status === 'pending') {
        const scheduledDateTime = new Date(`${schedule.date}T${schedule.scheduledTime}`);
        const timeDiff = now.getTime() - scheduledDateTime.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff > this.MISSED_THRESHOLD) {
          schedule.status = 'missed';
          missedSchedules.push(schedule);
          await this.updateSchedule(schedule);
        }
      }
    }

    return missedSchedules;
  }

  async getTodaysSchedules(): Promise<MedicineSchedule[]> {
    const today = new Date().toISOString().split('T')[0];
    const schedules = await this.getAllSchedules();
    return schedules.filter(s => s.date === today);
  }

  async getUpcomingDoses(hours: number = 2): Promise<MedicineSchedule[]> {
    const schedules = await this.getTodaysSchedules();
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return schedules.filter(schedule => {
      if (schedule.status !== 'pending') return false;
      
      const scheduledDateTime = new Date(`${schedule.date}T${schedule.scheduledTime}`);
      return scheduledDateTime >= now && scheduledDateTime <= futureTime;
    });
  }

  async getAdherenceStats(days: number = 7): Promise<{
    totalDoses: number;
    takenDoses: number;
    missedDoses: number;
    skippedDoses: number;
    adherenceRate: number;
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const schedules = await this.getAllSchedules();
    const periodSchedules = schedules.filter(s => {
      const scheduleDate = new Date(s.date);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });

    const totalDoses = periodSchedules.length;
    const takenDoses = periodSchedules.filter(s => s.status === 'taken').length;
    const missedDoses = periodSchedules.filter(s => s.status === 'missed').length;
    const skippedDoses = periodSchedules.filter(s => s.status === 'skipped').length;
    
    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    return {
      totalDoses,
      takenDoses,
      missedDoses,
      skippedDoses,
      adherenceRate: Math.round(adherenceRate),
    };
  }

  private async scheduleNotification(schedule: MedicineSchedule): Promise<string> {
    const [hours, minutes] = schedule.scheduledTime.split(':').map(Number);
    
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Medicine Reminder',
        body: `Time to take ${schedule.medicineName} (${schedule.dosage})`,
        data: {
          scheduleId: schedule.id,
          medicineId: schedule.medicineId,
          type: 'medicine_reminder',
        },
        sound: true,
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: false,
      },
    });
  }

  private async getAllSchedules(): Promise<MedicineSchedule[]> {
    try {
      const schedulesJson = await AsyncStorage.getItem(this.SCHEDULES_KEY);
      return schedulesJson ? JSON.parse(schedulesJson) : [];
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  private async saveSchedules(schedules: MedicineSchedule[]): Promise<void> {
    const existingSchedules = await this.getAllSchedules();
    const allSchedules = [...existingSchedules, ...schedules];
    await AsyncStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(allSchedules));
  }

  private async updateSchedule(schedule: MedicineSchedule): Promise<void> {
    const schedules = await this.getAllSchedules();
    const index = schedules.findIndex(s => s.id === schedule.id);
    
    if (index !== -1) {
      schedules[index] = schedule;
      await AsyncStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules));
    }
  }

  async startMissedDoseChecker(): Promise<void> {
    // Check for missed doses every 5 minutes
    setInterval(async () => {
      await this.checkMissedDoses();
    }, 5 * 60 * 1000);
  }
}

export const medicineTracker = new MedicineTracker();