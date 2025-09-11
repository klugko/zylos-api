import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(id: string, userId?: string): Promise<void> {
    const existing = await this.taskRepo.findById(id);
    if (!existing) throw new NotFoundException("Task not found");

    await this.taskRepo.delete(id);

    if (userId) {
      await this.activityLogger.logTaskAction(
        userId,
        ActivityAction.TASK_DELETED,
        id,
        existing.projectId,
        `Tâche "${existing.title}" supprimée`,
        `La tâche a été supprimée définitivement`,
        {
          taskTitle: existing.title,
          taskStatus: existing.status,
          taskPriority: existing.priority,
          assignedUserId: existing.assignedUserId,
        }
      );
    }
  }
}
