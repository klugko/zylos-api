import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { ReminderNotification } from '../../domain/entities/reminder-notification.entity';
import { v4 as uuidv4 } from 'uuid';
import { ReminderNotificationRepository } from '@modules/project-management/domain/interfaces/reminder-notification.repository.interface';
import { Task } from '@modules/project-management/domain/entities/task.entity';
import { TaskPriority, TaskStatus } from '@modules/project-management/domain/enums/task.enums';

@Injectable()
export class PrismaReminderNotificationRepository implements ReminderNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(notification: ReminderNotification): Promise<void> {
    await this.prisma.reminderNotification.create({
      data: {
        id: notification.id ?? uuidv4(),
        title: notification.title,
        message: notification.message,
        userId: notification.userId,
        taskId: notification.taskId,
        createdAt: notification.createdAt,
      },
    });
  }

  async findByUser(userId: string): Promise<ReminderNotification[]> {
    const data = await this.prisma.reminderNotification.findMany({ where: { userId } });
    return data.map(d => new ReminderNotification(
      d.id, d.title, d.message, d.userId, d.taskId, d.createdAt
    ));
  }

  // ⏰ Tâches en retard
  async findByUserAndEndDateBefore(userId: string, before: Date): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: { lt: before },
        status: { not: 'DONE' },
      },
    });

    return records.map(this.toEntity);
  }

  // 📅 Tâches à échéance proche
  async findByUserAndEndDateBetween(userId: string, start: Date, end: Date): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: {
          gte: start,
          lte: end,
        },
        status: { not: 'DONE' },
      },
    });

    return records.map(this.toEntity);
  }

  // 💤 Tâches sans date de fin et toujours en attente
  async findUserIdleTasks(userId: string, referenceDate: Date): Promise<Task[]> {
    const records = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: null,
        createdAt: { lt: referenceDate },
        status: {
          in: ['TODO', 'IN_PROGRESS'],
        },
      },
    });

    return records.map(this.toEntity);
  }

  // 🎯 Mapper vers entité métier
  private toEntity(record: any): Task {
    return new Task(
      record.id,
      record.title,
      record.description ?? null,
      record.status as TaskStatus,
      record.priority as TaskPriority,
      record.projectId,
      record.createdAt,
      record.updatedAt,
      record.startDate,
      record.endDate,
      record.dependencies ?? [],
      record.assignedUserId,
      record.columnId,
    );
  }
}
