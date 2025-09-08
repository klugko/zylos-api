import { Injectable, Logger, Inject } from "@nestjs/common";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { IStatusDurationRepository } from "../../domain/interfaces/status-duration-repository.interface";
import { StatusNotificationService } from "./status-notification.service";
import { TaskStatus } from "../../domain/enums/task.enums";

@Injectable()
export class CustomStatusIntegrationService {
  private readonly logger = new Logger(CustomStatusIntegrationService.name);

  constructor(
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository,
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("IStatusDurationRepository")
    private readonly statusDurationRepo: IStatusDurationRepository,
    private readonly statusNotificationService: StatusNotificationService
  ) {}

  async initializeDefaultStatuses(projectId: string): Promise<void> {
    const existingStatuses =
      await this.customStatusRepo.findByProjectId(projectId);

    if (existingStatuses.length > 0) {
      this.logger.log(
        `Project ${projectId} already has custom statuses configured`
      );
      return;
    }

    const defaultStatuses = [
      {
        name: "En attente",
        description: "Tâche en attente de démarrage",
        color: "#FFA500",
        order: 1,
        isDefault: true,
      },
      {
        name: "En cours",
        description: "Tâche en cours d'exécution",
        color: "#007BFF",
        order: 2,
        isDefault: true,
      },
      {
        name: "En validation",
        description: "Tâche en attente de validation",
        color: "#FFC107",
        order: 3,
        isDefault: true,
      },
      {
        name: "En révision",
        description: "Tâche en cours de révision",
        color: "#6F42C1",
        order: 4,
        isDefault: true,
      },
      {
        name: "Terminé",
        description: "Tâche terminée",
        color: "#28A745",
        order: 5,
        isDefault: true,
      },
    ];

    for (const status of defaultStatuses) {
      const customStatus = {
        id: require("uuid").v4(),
        name: status.name,
        description: status.description,
        color: status.color,
        order: status.order,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isDefault: status.isDefault,
      };

      await this.customStatusRepo.create(customStatus as any);
    }

    this.logger.log(
      `Initialized default custom statuses for project ${projectId}`
    );
  }

  async syncTaskStatusWithCustomStatus(
    taskId: string,
    newTaskStatus: TaskStatus
  ): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const customStatuses = await this.customStatusRepo.findByProjectIdAndActive(
      task.projectId
    );

    if (customStatuses.length === 0) {
      await this.initializeDefaultStatuses(task.projectId);
      return;
    }

    const activeDuration =
      await this.statusDurationRepo.findActiveByTaskId(taskId);

    if (activeDuration) {
      activeDuration.complete(new Date());
      await this.statusDurationRepo.update(activeDuration);
    }

    const statusMapping = this.getStatusMapping();
    const customStatusName = statusMapping[newTaskStatus];

    if (customStatusName) {
      const customStatus = customStatuses.find(
        (status) => status.name === customStatusName
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
          `Synced task ${taskId} status ${newTaskStatus} with custom status ${customStatusName}`
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

  async getTaskStatusWithCustomStatus(taskId: string): Promise<{
    taskStatus: TaskStatus;
    customStatus?: any;
    duration?: number;
  }> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const activeDuration =
      await this.statusDurationRepo.findActiveByTaskId(taskId);

    if (activeDuration) {
      const customStatus = await this.customStatusRepo.findById(
        activeDuration.customStatusId
      );

      return {
        taskStatus: task.status,
        customStatus,
        duration: activeDuration.getDurationInDays(),
      };
    }

    return {
      taskStatus: task.status,
    };
  }
}
