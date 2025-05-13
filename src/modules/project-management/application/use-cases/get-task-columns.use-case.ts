import { Injectable } from '@nestjs/common';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';
import { TaskColumn } from '../../domain/entities/task-column.entity';

@Injectable()
export class GetTaskColumnsUseCase {
  constructor(private readonly columnRepository: TaskColumnRepository) {}

  async execute(projectId: string): Promise<TaskColumn[]> {
    return this.columnRepository.findByProjectId(projectId);
  }
}
