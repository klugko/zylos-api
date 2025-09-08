import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IStatusDurationRepository } from "../../domain/interfaces/status-duration-repository.interface";
import { IStatusAlertRepository } from "../../domain/interfaces/status-alert-repository.interface";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import {
  StatusAlert,
  AlertType,
  AlertSeverity,
} from "../../domain/entities/status-alert.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class StatusMonitoringService {
  private readonly logger = new Logger(StatusMonitoringService.name);

  constructor(
    @Inject("IStatusDurationRepository")
    private readonly statusDurationRepo: IStatusDurationRepository,
    @Inject("IStatusAlertRepository")
    private readonly statusAlertRepo: IStatusAlertRepository,
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async monitorStatusDurations(): Promise<void> {
    this.logger.log("Starting status duration monitoring...");

    const activeDurations = await this.statusDurationRepo.findByProjectId("");

    for (const duration of activeDurations) {
      if (duration.endDate) continue;

      const currentDuration = duration.getDurationInDays();
      const statistics = await this.statusDurationRepo.getDurationStatistics(
        duration.customStatusId
      );

      if (statistics.count < 3) continue;

      const threshold = statistics.average + 2 * statistics.standardDeviation;

      if (currentDuration > threshold) {
        await this.createDurationAlert(
          duration,
          currentDuration,
          statistics.average
        );
      }
    }

    this.logger.log("Status duration monitoring completed");
  }

  private async createDurationAlert(
    duration: any,
    currentDuration: number,
    averageDuration: number
  ): Promise<void> {
    const existingAlert = await this.statusAlertRepo.findByTaskId(
      duration.taskId
    );
    const unresolvedAlert = existingAlert.find(
      (alert) => alert.type === AlertType.DURATION_EXCEEDED && !alert.isResolved
    );

    if (unresolvedAlert) return;

    const severity = this.calculateSeverity(currentDuration, averageDuration);
    const message = `La tâche est restée ${currentDuration} jours dans le statut "${duration.customStatus?.name || "Inconnu"}", soit ${Math.round(((currentDuration - averageDuration) / averageDuration) * 100)}% au-dessus de la moyenne.`;

    const alert = new StatusAlert(
      uuidv4(),
      duration.taskId,
      duration.projectId,
      duration.customStatusId,
      AlertType.DURATION_EXCEEDED,
      severity,
      message,
      null,
      false,
      new Date()
    );

    await this.statusAlertRepo.create(alert);
    this.logger.warn(
      `Created duration alert for task ${duration.taskId}: ${message}`
    );
  }

  private calculateSeverity(
    currentDuration: number,
    averageDuration: number
  ): AlertSeverity {
    const ratio = currentDuration / averageDuration;

    if (ratio >= 3) return AlertSeverity.CRITICAL;
    if (ratio >= 2.5) return AlertSeverity.HIGH;
    if (ratio >= 2) return AlertSeverity.MEDIUM;
    return AlertSeverity.LOW;
  }

  async getStatusStatistics(projectId: string): Promise<any> {
    const customStatuses =
      await this.customStatusRepo.findByProjectIdAndActive(projectId);
    const statistics = [];

    for (const status of customStatuses) {
      const stats = await this.statusDurationRepo.getDurationStatistics(
        status.id
      );
      statistics.push({
        statusId: status.id,
        statusName: status.name,
        ...stats,
      });
    }

    return statistics;
  }

  async suggestStatusChange(taskId: string): Promise<string | null> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return null;

    const activeDuration =
      await this.statusDurationRepo.findActiveByTaskId(taskId);
    if (!activeDuration) return null;

    const statistics = await this.statusDurationRepo.getDurationStatistics(
      activeDuration.customStatusId
    );
    const currentDuration = activeDuration.getDurationInDays();

    if (statistics.count < 5) return null;

    const threshold = statistics.average + 2 * statistics.standardDeviation;

    if (currentDuration > threshold) {
      const customStatuses =
        await this.customStatusRepo.findByProjectIdAndActive(task.projectId);
      const currentCustomStatus = await this.customStatusRepo.findById(
        activeDuration.customStatusId
      );
      const nextStatus = customStatuses.find(
        (status) =>
          status.order > (currentCustomStatus?.order || 0) && status.isActive
      );

      return nextStatus?.id || null;
    }

    return null;
  }
}
