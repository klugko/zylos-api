import { Injectable, Logger, Inject } from "@nestjs/common";
import { IStatusAlertRepository } from "../../domain/interfaces/status-alert-repository.interface";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { ProjectRepository } from "../../domain/interfaces/project-repository.interface";
import {
  StatusAlert,
  AlertType,
  AlertSeverity,
} from "../../domain/entities/status-alert.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class StatusNotificationService {
  private readonly logger = new Logger(StatusNotificationService.name);

  constructor(
    @Inject("IStatusAlertRepository")
    private readonly statusAlertRepo: IStatusAlertRepository,
    @Inject("TaskRepository")
    private readonly taskRepo: TaskRepository,
    @Inject("ProjectRepository")
    private readonly projectRepo: ProjectRepository
  ) {}

  async createAlert(
    taskId: string,
    projectId: string,
    customStatusId: string,
    type: AlertType,
    severity: AlertSeverity,
    message: string,
    suggestedStatusId?: string
  ): Promise<StatusAlert> {
    const alert = new StatusAlert(
      uuidv4(),
      taskId,
      projectId,
      customStatusId,
      type,
      severity,
      message,
      suggestedStatusId || null,
      false,
      new Date()
    );

    const createdAlert = await this.statusAlertRepo.create(alert);
    this.logger.log(`Created ${type} alert for task ${taskId}: ${message}`);

    return createdAlert;
  }

  async getProjectAlerts(
    projectId: string,
    unresolvedOnly: boolean = true
  ): Promise<StatusAlert[]> {
    if (unresolvedOnly) {
      return await this.statusAlertRepo.findUnresolvedByProjectId(projectId);
    }
    return await this.statusAlertRepo.findByProjectId(projectId);
  }

  async getTaskAlerts(taskId: string): Promise<StatusAlert[]> {
    return await this.statusAlertRepo.findByTaskId(taskId);
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alert = await this.statusAlertRepo.findByTaskId(alertId);
    if (alert.length === 0) {
      this.logger.warn(`Alert ${alertId} not found`);
      return;
    }

    await this.statusAlertRepo.resolve(alertId);
    this.logger.log(`Resolved alert ${alertId}`);
  }

  async getAlertStatistics(projectId: string): Promise<{
    total: number;
    unresolved: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
  }> {
    const allAlerts = await this.statusAlertRepo.findByProjectId(projectId);
    const unresolvedAlerts = allAlerts.filter((alert) => !alert.isResolved);

    const byType = allAlerts.reduce(
      (acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      },
      {} as Record<AlertType, number>
    );

    const bySeverity = allAlerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<AlertSeverity, number>
    );

    return {
      total: allAlerts.length,
      unresolved: unresolvedAlerts.length,
      byType,
      bySeverity,
    };
  }

  async sendStatusChangeNotification(
    taskId: string,
    oldStatusId: string,
    newStatusId: string
  ): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const message = `La tâche "${task.title}" a changé de statut.`;

    await this.createAlert(
      taskId,
      task.projectId,
      newStatusId,
      AlertType.STATUS_STAGNATION,
      AlertSeverity.LOW,
      message
    );
  }

  async sendAutoSuggestionNotification(
    taskId: string,
    currentStatusId: string,
    suggestedStatusId: string
  ): Promise<void> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const message = `Suggestion automatique: La tâche "${task.title}" pourrait passer au statut suivant.`;

    await this.createAlert(
      taskId,
      task.projectId,
      currentStatusId,
      AlertType.AUTO_SUGGESTION,
      AlertSeverity.MEDIUM,
      message,
      suggestedStatusId
    );
  }
}
