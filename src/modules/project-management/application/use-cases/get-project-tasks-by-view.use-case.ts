import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class GetProjectTasksByViewUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
    @Inject('TaskColumnRepository') private readonly columnRepo: TaskColumnRepository,
  ) {}

  async execute(
    projectId: string,
    view: 'kanban' | 'gantt' | 'list' = 'list'
  ): Promise<any> {
    const tasks: Task[] = await this.taskRepo.findByProject(projectId);

    switch (view) {
      case 'kanban':
        return this.formatKanban(projectId, tasks);
      case 'gantt':
        return this.formatGantt(tasks);
      case 'list':
      default:
        return this.formatList(tasks);
    }
  }

  private async formatKanban(projectId: string, tasks: Task[]) {
    const columns = await this.columnRepo.findByProjectId(projectId);
    const columnMap = columns.reduce((acc, col) => {
      acc[col.id] = { columnId: col.id, name: col.name, order: col.order, tasks: [] };
      return acc;
    }, {} as Record<string, any>);

    for (const task of tasks) {
      if (task.columnId && columnMap[task.columnId]) {
        columnMap[task.columnId].tasks.push(task);
      }
    }

    return {
      columns: Object.values(columnMap).sort((a, b) => a.order - b.order)
    };
  }

  private formatGantt(tasks: Task[]) {
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      start: t.startDate || t.createdAt,
      end: t.endDate || t.updatedAt,
      progress: t.progress ?? 0,
      dependencies: t.dependencies || [],
      estimatedTime: t.estimatedTime,
    }));
  }

  private formatList(tasks: Task[]) {
    return tasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        startDate: t.startDate,
        endDate: t.endDate,
        columnId: t.columnId,
        progress: t.progress,
        assigneeId: t.assignedUserId,
        estimatedTime: t.estimatedTime,
      }));
  }
}
