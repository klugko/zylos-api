import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { TaskStatus } from '../../domain/enums/task-status.enum';
import { Task } from '../../domain/entities/task.entity';


@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    if (!data) return null;
    return new Task(
      data.id, data.title, data.description,
      data.status as TaskStatus,
      data.projectId,
      data.startDate,
      data.endDate,
      data.createdAt, data.updatedAt
    );
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const results = await this.prisma.task.findMany({ where: { projectId } });
    return results.map(task => new Task(
      task.id, task.title, task.description,
      task.status as TaskStatus,
      task.projectId, 
      task.startDate,
      task.endDate,
      task.createdAt, task.updatedAt
    ));
  }

  async create(task: Task): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        status: task.status,
        startDate: task.startDate,
        endDate: task.endDate,
        dependencies: task.dependencies
      },
    });
    return new Task(
      created.id,
      created.title,
      created.description,
      created.status as TaskStatus,
      created.projectId,
      created.createdAt,
      created.updatedAt,
      created.startDate,
      created.endDate,
      created.dependencies
    );
    
  }

  async update(task: Task): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
      }
    });
    return new Task(
      updated.id, updated.title, updated.description,
      updated.status as TaskStatus,
      updated.projectId,
      updated.startDate,
      updated.endDate,
      updated.createdAt, updated.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
