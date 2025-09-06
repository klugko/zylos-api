import { ActivityLog } from "../entities/activity-log.entity";
import { GetActivityLogsDto } from "../../application/dto/get-activity-logs.dto";
import { ActivityType, ActivityAction } from "../enums/activity.enums";

export interface ActivityLogRepository {
  create(activityLog: ActivityLog): Promise<ActivityLog>;
  findById(id: string): Promise<ActivityLog | null>;
  findMany(
    query: GetActivityLogsDto
  ): Promise<{ activities: ActivityLog[]; total: number }>;
  findByProjectId(projectId: string, limit?: number): Promise<ActivityLog[]>;
  findByUserId(userId: string, limit?: number): Promise<ActivityLog[]>;
  findByType(type: ActivityType, limit?: number): Promise<ActivityLog[]>;
  findByAction(action: ActivityAction, limit?: number): Promise<ActivityLog[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<ActivityLog[]>;
  findByEntity(
    entityType: string,
    entityId: string,
    limit?: number
  ): Promise<ActivityLog[]>;
  getStatistics(
    projectId?: string,
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesByUser: Record<string, number>;
    activitiesByDay: Record<string, number>;
    mostActiveDay?: string;
    mostActiveUser?: string;
  }>;
  delete(id: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteOldLogs(olderThan: Date): Promise<number>;
}
