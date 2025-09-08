import { Injectable, Logger, Inject } from "@nestjs/common";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { IStatusDurationRepository } from "../../domain/interfaces/status-duration-repository.interface";
import { StatusNotificationService } from "./status-notification.service";
import { TaskStatus } from "../../domain/enums/task.enums";

@Injectable()
export class TaskStatusSyncService {
  private readonly logger = new Logger(TaskStatusSyncService.name);

  constructor(
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository,
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("IStatusDurationRepository")
    private readonly statusDurationRepo: IStatusDurationRepository,
    private readonly statusNotificationService: StatusNotificationService
  ) {}

  async syncTaskStatusChange(
    taskId: string,
    oldStatus: TaskStatus,
    newStatus: TaskStatus
  ): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const customStatuses = await this.customStatusRepo.findByProjectIdAndActive(
      task.projectId
    );

    if (customStatuses.length === 0) {
      this.logger.warn(
        `No custom statuses found for project ${task.projectId}, skipping sync`
      );
      return;
    }

    const activeDuration =
      await this.statusDurationRepo.findActiveByTaskId(taskId);

    if (activeDuration) {
      activeDuration.complete(new Date());
      await this.statusDurationRepo.update(activeDuration);
    }

    const statusMapping = this.getStatusMapping();
    const newCustomStatusName = statusMapping[newStatus];

    if (newCustomStatusName) {
      const customStatus = customStatuses.find(
        (status) => status.name === newCustomStatusName
      );

      if (customStatus) {
        const newDuration = {
          id: require("uuid").v4(),
          taskId,
          customStatusId: customStatus.id,
          projectId: task.projectId,
          startDate: new Date(),
          endDate: null,
          duration: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.statusDurationRepo.create(newDuration as any);

        this.logger.log(
          `Synced task ${taskId} status change from ${oldStatus} to ${newStatus} with custom status ${newCustomStatusName}`
        );

        await this.statusNotificationService.sendStatusChangeNotification(
          taskId,
          activeDuration?.customStatusId || "",
          customStatus.id
        );
      }
    }
  }

  private getStatusMapping(): Record<TaskStatus, string> {
    return {
      [TaskStatus.TODO]: "En attente",
      [TaskStatus.IN_PROGRESS]: "En cours",
      [TaskStatus.DONE]: "Terminé",
      [TaskStatus.CANCELLED]: "Terminé",
    };
  }

  async getTaskWithCustomStatus(taskId: string): Promise<{
    task: any;
    customStatus?: any;
    duration?: number;
    alerts?: any[];
  }> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const activeDuration =
      await this.statusDurationRepo.findActiveByTaskId(taskId);

    let customStatus = null;
    let duration = 0;

    if (activeDuration) {
      customStatus = await this.customStatusRepo.findById(
        activeDuration.customStatusId
      );
      duration = activeDuration.getDurationInDays();
    }

    const alerts = await this.statusNotificationService.getTaskAlerts(taskId);

    return {
      task,
      customStatus,
      duration,
      alerts,
    };
  }
}
