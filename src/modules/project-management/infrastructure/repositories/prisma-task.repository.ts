import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TaskStatus, TaskPriority } from '../../domain/enums/task.enums';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    if (!data) return null;

    return new Task(
      data.id,
      data.title,
      data.description,
      data.status as TaskStatus,
      data.priority as TaskPriority ?? TaskPriority.MEDIUM,
      data.projectId,
      data.createdAt,
      data.updatedAt,
      data.startDate ?? null,
      data.endDate ?? null,
      data.dependencies,
      data.assignedUserId ?? '',
    );
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const results = await this.prisma.task.findMany({ where: { projectId } });

    return results.map(task =>
      new Task(
        task.id,
        task.title,
        task.description,
        task.status as TaskStatus,
        task.priority as TaskPriority,
        task.projectId,
        task.createdAt,
        task.updatedAt,
        task.startDate ?? null,
        task.endDate ?? null,
        task.dependencies,
        task.assignedUserId ?? '',
      ),
    );
  }

  async create(task: Task): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority ?? TaskPriority.MEDIUM,
        projectId: task.projectId,
        startDate: task.startDate ?? undefined,
        endDate: task.endDate ?? undefined,
        dependencies: task.dependencies ?? [],
        assignedUserId: task.assignedUserId || undefined,
      },
    });
  
    return new Task(
      created.id,
      created.title,
      created.description,
      created.status as TaskStatus,
      created.priority as TaskPriority,
      created.projectId,
      created.createdAt,
      created.updatedAt,
      created.startDate ?? null,
      created.endDate ?? null,
      created.dependencies,
      created.assignedUserId ?? '',
    );
  }
  
  

  async update(task: Task): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status, 
        priority: task.priority ?? undefined,
        startDate: task.startDate ?? undefined,
        endDate: task.endDate ?? undefined,
        dependencies: task.dependencies,
        assignedUserId: task.assignedUserId || undefined,
      },
    });

    return new Task(
      updated.id,
      updated.title,
      updated.description,
      updated.status as TaskStatus,
      updated.priority as TaskPriority,
      updated.projectId,
      updated.createdAt,
      updated.updatedAt,
      updated.startDate ?? null,
      updated.endDate ?? null,
      updated.dependencies,
      updated.assignedUserId ?? '',
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
  
  async exists(taskId: string): Promise<boolean> {
    const count = await this.prisma.task.count({ where: { id: taskId } });
    return count > 0;
  }


  async bulkCreate(tasks: Task[]): Promise<void> {
    if (!tasks.length) return;
    await this.prisma.task.createMany({
      data: tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        startDate: t.startDate,
        endDate: t.endDate,
        dependencies: t.dependencies,
        assignedUserId: t.assignedUserId,
        columnId: t.columnId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      skipDuplicates: true,
    });
  }
  
  async countByProject(projectId: string): Promise<number> {
    return this.prisma.task.count({ where: { projectId } });
  }
  
  async countByProjectAndStatus(projectId: string, status: string): Promise<number> {
    return this.prisma.task.count({
      where: {
        projectId,
        status: status as TaskStatus,
      },
    });
  }

  async findByStatusAndEndDateBefore(statuses: TaskStatus[], date: Date): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        status: { in: statuses },
        endDate: { lt: date },
      },
    });
    return data.map(this.toEntity);
  }

  async findByStatusAndEndDateBetween(statuses: TaskStatus[], from: Date, to: Date): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        status: { in: statuses },
        endDate: { gte: from, lte: to },
      },
    });
    return data.map(this.toEntity);
  }

  async findIdleTasksWithoutStartDate(before: Date): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        startDate: null,
        status: TaskStatus.TODO,
        createdAt: { lt: before },
      },
    });
    return data.map(this.toEntity);
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