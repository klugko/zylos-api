import { Injectable } from '@nestjs/common';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';
import { TaskColumn } from '../../domain/entities/task-column.entity';


@Injectable()
export class UpdateTaskColumnOrderUseCase {
  constructor(private readonly repository: TaskColumnRepository) {}

  async execute(id: string, order: number): Promise<TaskColumn> {
    return this.repository.updateOrder(id, order);
  }
}
