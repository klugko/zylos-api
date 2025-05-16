import { Injectable, Inject } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Task } from '../../domain/entities/task.entity';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus, TaskPriority } from '../../domain/enums/task.enums';


@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const now = new Date();
    const task = new Task(
      uuidv4(),
      dto.title,
      dto.description ?? null,
      TaskStatus.TODO,
      TaskPriority.MEDIUM,
      dto.projectId,
      new Date(),
      new Date(),
      dto.startDate,
      dto.endDate,
      dto.dependencies ?? [],
    );
  
    return await this.taskRepo.create(task);
  }
}