import { Inject, Injectable } from '@nestjs/common';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';
import { UpdateTaskColumnDto } from '../dto/update-task-column.dto';
import { TaskColumn } from '../../domain/entities/task-column.entity';

@Injectable()
export class UpdateTaskColumnUseCase {
  constructor(@Inject('TaskColumnRepository') private readonly repository: TaskColumnRepository
) {}

  async execute(id: string, dto: UpdateTaskColumnDto): Promise<TaskColumn> {
    return this.repository.update(id, dto);
  }
}
