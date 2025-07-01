import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { TaskStatus } from '../../domain/enums/task.enums';

@Injectable()
export class GetProjectProgressUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
  ) {}

  async execute(projectId: string): Promise<{
    progress: number;
    statusDetails: Record<TaskStatus, number>;
    totalTasks: number;
  }> {
    const tasks = await this.taskRepo.findByProject(projectId);
    const total = tasks.length;

    const weights: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 50,
      DONE: 100,
      CANCELLED: 0,
    };

    const statusDetails: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
      CANCELLED: 0,
    };

    let sum = 0;

    for (const task of tasks) {
      statusDetails[task.status]++;
      sum += weights[task.status] ?? 0;
    }

    const progress = total > 0 ? Math.round((sum / (total * 100)) * 100) : 0;

    return {
      progress,
      statusDetails,
      totalTasks: total,
    };
  }
}
