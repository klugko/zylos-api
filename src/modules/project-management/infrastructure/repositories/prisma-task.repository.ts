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
}