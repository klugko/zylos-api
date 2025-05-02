import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { Task } from '../../domain/entities/task.entity';


@Injectable()
export class GetProjectTasksByViewUseCase {
   constructor(
      @Inject('TaskRepository') private readonly taskRepo: TaskRepository
    ) {}

  async execute(projectId: string, view: 'kanban' | 'gantt' | 'list' = 'list'): Promise<any> {
    const tasks = await this.taskRepo.findByProject(projectId);

    switch (view) {
      case 'kanban':
        return this.formatKanban(tasks);
      case 'gantt':
        return this.formatGantt(tasks);
      case 'list':
      default:
        return this.formatList(tasks);
    }
  }

  private formatKanban(tasks: Task[]) {
    return {
      TODO: tasks.filter(t => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
      DONE: tasks.filter(t => t.status === 'DONE'),
    };
  }

  private formatGantt(tasks: Task[]) {
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      start: t['startDate'] || t['createdAt'], 
      end: t['endDate'] || t['updatedAt'],
    }));
  }

  private formatList(tasks: Task[]) {
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
