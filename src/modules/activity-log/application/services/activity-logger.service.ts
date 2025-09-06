import { Injectable, Inject } from "@nestjs/common";
import { ActivityLogRepository } from "../../domain/interfaces/activity-log-repository.interface";
import { ActivityLog } from "../../domain/entities/activity-log.entity";
import { CreateActivityLogDto } from "../dto/create-activity-log.dto";
import {
  ActivityType,
  ActivityAction,
} from "../../domain/enums/activity.enums";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ActivityLoggerService {
  constructor(
    @Inject("ActivityLogRepository")
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async logActivity(dto: CreateActivityLogDto): Promise<ActivityLog> {
    const activityLog = new ActivityLog(
      uuidv4(),
      dto.userId,
      dto.projectId || null,
      dto.taskId || null,
      dto.documentId || null,
      dto.surveyId || null,
      dto.type,
      dto.action,
      dto.title,
      dto.description || null,
      dto.metadata || null,
      dto.ipAddress || null,
      dto.userAgent || null,
      new Date()
    );

    return this.activityLogRepository.create(activityLog);
  }

  // Helper methods for common logging patterns
  async logTaskAction(
    userId: string,
    action: ActivityAction,
    taskId: string,
    projectId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      projectId,
      taskId,
      type: ActivityType.TASK,
      action,
      title,
      description,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logProjectAction(
    userId: string,
    action: ActivityAction,
    projectId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      projectId,
      type: ActivityType.PROJECT,
      action,
      title,
      description,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logDocumentAction(
    userId: string,
    action: ActivityAction,
    documentId: string,
    projectId: string,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      projectId,
      documentId,
      type: ActivityType.DOCUMENT,
      action,
      title,
      description,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logSurveyAction(
    userId: string,
    action: ActivityAction,
    surveyId: string,
    projectId?: string,
    title?: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      projectId,
      surveyId,
      type: ActivityType.SURVEY,
      action,
      title: title || this.getDefaultSurveyTitle(action),
      description,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logUserAction(
    userId: string,
    action: ActivityAction,
    title: string,
    description?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      type: ActivityType.USER,
      action,
      title,
      description,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logSystemAction(
    action: ActivityAction,
    title: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId: "system",
      type: ActivityType.SYSTEM,
      action,
      title,
      description,
      metadata,
    });
  }

  // Helper method to create change metadata
  createChangeMetadata(
    oldValues: Record<string, any>,
    newValues: Record<string, any>
  ): Record<string, any> {
    const changes: Record<string, { old: any; new: any }> = {};

    Object.keys(newValues).forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          old: oldValues[key],
          new: newValues[key],
        };
      }
    });

    return {
      oldValues,
      newValues,
      changes,
      changeCount: Object.keys(changes).length,
    };
  }

  // Helper method to create assignment metadata
  createAssignmentMetadata(
    assignedTo: string,
    assignedBy: string,
    previousAssignee?: string
  ): Record<string, any> {
    return {
      assignedTo,
      assignedBy,
      previousAssignee,
      isReassignment: !!previousAssignee,
    };
  }

  // Helper method to create status change metadata
  createStatusChangeMetadata(
    oldStatus: string,
    newStatus: string,
    reason?: string
  ): Record<string, any> {
    return {
      oldStatus,
      newStatus,
      reason,
      statusChanged: oldStatus !== newStatus,
    };
  }

  private getDefaultSurveyTitle(action: ActivityAction): string {
    const titles: Record<ActivityAction, string> = {
      [ActivityAction.SURVEY_CREATED]: "Sondage créé",
      [ActivityAction.SURVEY_UPDATED]: "Sondage modifié",
      [ActivityAction.SURVEY_DELETED]: "Sondage supprimé",
      [ActivityAction.SURVEY_ACTIVATED]: "Sondage activé",
      [ActivityAction.SURVEY_CLOSED]: "Sondage fermé",
      [ActivityAction.SURVEY_VOTED]: "Vote enregistré",
      [ActivityAction.SURVEY_RESULTS_VIEWED]: "Résultats consultés",
    } as Record<ActivityAction, string>;

    return titles[action] || "Action sur sondage";
  }
}
