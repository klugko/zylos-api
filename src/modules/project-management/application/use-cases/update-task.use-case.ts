import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { UpdateTaskDto } from "../dto/update-task.dto";
import { Task } from "../../domain/entities/task.entity";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

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
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    id: string,
    dto: UpdateTaskDto,
    userId?: string
  ): Promise<Task> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new NotFoundException("Task not found");

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException("Start date cannot be after end date");
    }

    const oldValues = {
      title: existing.title,
      description: existing.description,
      status: existing.status,
      priority: existing.priority,
      assignedUserId: existing.assignedUserId,
    };

    const updated = await this.taskRepo.updateFull(id, dto as Partial<Task>);

    if (userId) {
      const changes = this.activityLogger.createChangeMetadata(oldValues, dto);

      await this.activityLogger.logTaskAction(
        userId,
        ActivityAction.TASK_UPDATED,
        id,
        existing.projectId,
        `Tâche "${existing.title}" modifiée`,
        `Modifications apportées à la tâche`,
        changes
      );
    }

    return updated;
  }
}
