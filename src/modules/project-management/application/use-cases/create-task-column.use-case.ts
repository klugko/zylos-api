import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { TaskColumnRepository } from '../../domain/interfaces/task-column-repository.interface';
import { CreateTaskColumnDto } from '../dto/create-task-column.dto';
import { TaskColumn } from '../../domain/entities/task-column.entity';


@Injectable()
export class CreateTaskColumnUseCase {
  constructor(@Inject('TaskColumnRepository') private readonly repository: TaskColumnRepository
){}

  async execute(dto: CreateTaskColumnDto): Promise<TaskColumn> {
    const column = new TaskColumn(
      uuid(),
      dto.name,
      dto.order,
      dto.projectId,
    );

    return this.repository.create(column);
  }
}
