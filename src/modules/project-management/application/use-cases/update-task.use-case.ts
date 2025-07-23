import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { Task } from '../../domain/entities/task.entity';




/**
 * Use Case: Update an existing Task.
 *
 * Responsibilities:
 * - Validate input data
 * - Ensure business rules (e.g., startDate cannot be after endDate)
 * - Call the repository to persist changes
 *
 * Immutable fields:
 * - `projectId` cannot be changed once created
 * - `dependencies` cannot be changed here
 *
 * @param id The Task identifier
 * @param dto The UpdateTaskDto with new values
 * @returns The updated Task entity
 */
@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepo: TaskRepository,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new NotFoundException('Task not found');

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    return await this.taskRepo.updateFull(id, dto as Partial<Task>);
  }
}
