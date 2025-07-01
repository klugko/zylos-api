import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';

@Injectable()
export class GetProjectProgressUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository
  ) {}

  async execute(projectId: string): Promise<{ progress: number }> {
    const total = await this.taskRepo.countByProject(projectId);
    if (total === 0) return { progress: 0 };

    const done = await this.taskRepo.countByProjectAndStatus(projectId, 'DONE');
    const progress = Math.round((done / total) * 100);

    return { progress };
  }
}
