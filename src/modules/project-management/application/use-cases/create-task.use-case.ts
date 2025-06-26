import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Task } from '../../domain/entities/task.entity';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus, TaskPriority } from '../../domain/enums/task.enums';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const now = new Date();

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('La date de début ne peut pas être après la date de fin.');
    }

    if (dto.dependencies?.length) {
      const invalidIds = [];
      for (const depId of dto.dependencies) {
        const exists = await this.taskRepo.exists(depId);
        if (!exists) invalidIds.push(depId);
      }
      if (invalidIds.length > 0) {
        throw new NotFoundException(`Les tâches dépendantes suivantes sont introuvables : ${invalidIds.join(', ')}`);
      }
    }

    const task = new Task(
      uuidv4(),
      dto.title,
      dto.description ?? null,
      TaskStatus.TODO,
      TaskPriority.MEDIUM,
      dto.projectId,
      now,
      now,
      dto.startDate,
      dto.endDate,
      dto.dependencies ?? [],
      dto.assignedUserId,     
      dto.columnId            
    );

    return await this.taskRepo.create(task);
  }
}
