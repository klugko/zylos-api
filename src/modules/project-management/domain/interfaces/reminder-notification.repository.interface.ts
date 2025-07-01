import { ReminderNotification } from '../entities/reminder-notification.entity';

export interface ReminderNotificationRepository {
  create(notification: ReminderNotification): Promise<void>;
  findByUser(userId: string): Promise<ReminderNotification[]>;
}
