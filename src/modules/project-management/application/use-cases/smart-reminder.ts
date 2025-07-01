import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { Inject } from '@nestjs/common';
import { TaskStatus } from '../../domain/enums/task.enums';
import { v4 as uuidv4 } from 'uuid';
import { ReminderNotification } from '../../domain/entities/reminder-notification.entity';
import { ReminderNotificationRepository } from '@modules/project-management/domain/interfaces/reminder-notification.repository.interface';

@Injectable()
export class SmartReminderService {
  private readonly logger = new Logger(SmartReminderService.name);
constructor(
  @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
  @Inject('ReminderNotificationRepository') private readonly notificationRepo: ReminderNotificationRepository,
) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleReminders(): Promise<void> {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [overdue, upcoming, idle] = await Promise.all([
      this.taskRepo.findByStatusAndEndDateBefore([TaskStatus.TODO, TaskStatus.IN_PROGRESS], now),
      this.taskRepo.findByStatusAndEndDateBetween([TaskStatus.TODO, TaskStatus.IN_PROGRESS], now, soon),
      this.taskRepo.findIdleTasksWithoutStartDate(now),
    ]);

    for (const task of overdue) {
      if (!task.assignedUserId) continue;
      await this.notificationRepo.create(new ReminderNotification(
          uuidv4(),
        '🚨 Tâche en retard',
        `La tâche "${task.title}" est en retard.`,
        task.assignedUserId,
        task.id,
        new Date(),
      ));
    }

    for (const task of upcoming) {
      if (!task.assignedUserId) continue;
      await this.notificationRepo.create(new ReminderNotification(
          uuidv4(),
        '⏰ Deadline proche',
        `La tâche "${task.title}" approche de la date limite.`,
        task.assignedUserId,
        task.id,
        new Date(),
      ));
    }

    for (const task of idle) {
      if (!task.assignedUserId) continue;
      await this.notificationRepo.create(new ReminderNotification(
          uuidv4(),
        '🕓 Tâche non démarrée',
        `La tâche "${task.title}" n’a pas encore commencé.`,
        task.assignedUserId,
        task.id,
        new Date(),
      ));
    }
  }
  async previewReminders(userId: string) {
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const [overdue, upcoming, idle] = await Promise.all([
      this.taskRepo.findByUserAndEndDateBefore(userId, now),
      this.taskRepo.findByUserAndEndDateBetween(userId, now, soon),
      this.taskRepo.findUserIdleTasks(userId, now),
    ]);

    return {
      overdue: overdue.map((t) => ({
        id: t.id,
        title: t.title,
        type: 'late',
        message: `La tâche "${t.title}" est en retard.`,
      })),
      upcoming: upcoming.map((t) => ({
        id: t.id,
        title: t.title,
        type: 'soon',
        message: `La tâche "${t.title}" arrive à échéance.`,
      })),
      idle: idle.map((t) => ({
        id: t.id,
        title: t.title,
        type: 'idle',
        message: `La tâche "${t.title}" n’a jamais été démarrée.`,
      })),
    };
  }


  /**
   * 🔍 Prévisualisation des rappels pour un utilisateur
   */
  async previewRemindersForUser(userId: string): Promise<any> {
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const lateTasks = await this.taskRepo.findByUserAndEndDateBefore(userId, now);
    const upcomingTasks = await this.taskRepo.findByUserAndEndDateBetween(userId, now, in3Days);
    const idleTasks = await this.taskRepo.findUserIdleTasks(userId, now);

    this.logger.log(`[Prévisualisation] User ${userId} → ${lateTasks.length} en retard, ${upcomingTasks.length} à venir, ${idleTasks.length} inactives`);

    return {
      late: lateTasks,
      upcoming: upcomingTasks,
      idle: idleTasks,
    };
  }
  
}
