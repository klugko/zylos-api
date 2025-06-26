import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';

@Injectable()
export class GetProjectTasksByViewUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
    @Inject('TaskColumnRepository') private readonly columnRepo: TaskColumnRepository,
  ) {}

  async execute(projectId: string, view: 'kanban' | 'gantt' | 'list' = 'list'): Promise<any> {
    const tasks = await this.taskRepo.findByProject(projectId);

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

  private async formatKanban(projectId: string, tasks: any[]) {
    const columns = await this.columnRepo.findByProjectId(projectId);
    const grouped = {};

    for (const col of columns) {
      grouped[col.id] = {
        columnId: col.id,
        name: col.name,
        tasks: tasks.filter(t => t.columnId === col.id)
      };
    }

    return grouped;
  }

  private formatGantt(tasks: any[]) {
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      start: t.startDate || t.createdAt,
      end: t.endDate || t.updatedAt,
    }));
  }

  private formatList(tasks: any[]) {
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}