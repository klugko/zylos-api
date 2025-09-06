import { Injectable, Inject } from "@nestjs/common";
import { ActivityLogRepository } from "../../domain/interfaces/activity-log-repository.interface";
import { ActivityTimeline } from "../../domain/entities/activity-timeline.entity";
import { ActivityLog } from "../../domain/entities/activity-log.entity";
import { GetActivityLogsDto } from "../dto/get-activity-logs.dto";
import {
  ActivityType,
  ActivityFilterType,
} from "../../domain/enums/activity.enums";

@Injectable()
export class ActivityTimelineService {
  constructor(
    @Inject("ActivityLogRepository")
    private readonly activityLogRepository: ActivityLogRepository
  ) {}

  async getProjectTimeline(
    projectId: string,
    query: GetActivityLogsDto
  ): Promise<ActivityTimeline> {
    const projectQuery = { ...query, projectId };
    const { activities, total } =
      await this.activityLogRepository.findMany(projectQuery);

    return new ActivityTimeline(
      projectId,
      activities,
      total,
      activities.length < (query.limit || 20)
    );
  }

  async getUserTimeline(
    userId: string,
    query: GetActivityLogsDto
  ): Promise<ActivityTimeline> {
    const userQuery = { ...query, userId };
    const { activities, total } =
      await this.activityLogRepository.findMany(userQuery);

    return new ActivityTimeline(
      null,
      activities,
      total,
      activities.length < (query.limit || 20)
    );
  }

  async getGlobalTimeline(
    query: GetActivityLogsDto
  ): Promise<ActivityTimeline> {
    const { activities, total } =
      await this.activityLogRepository.findMany(query);

    return new ActivityTimeline(
      null,
      activities,
      total,
      activities.length < (query.limit || 20)
    );
  }

  async getFilteredTimeline(
    query: GetActivityLogsDto
  ): Promise<ActivityTimeline> {
    const { activities, total } =
      await this.activityLogRepository.findMany(query);

    return new ActivityTimeline(
      query.projectId || null,
      activities,
      total,
      activities.length < (query.limit || 20)
    );
  }

  async getRecentActivities(
    projectId?: string,
    limit: number = 10
  ): Promise<ActivityLog[]> {
    if (projectId) {
      return this.activityLogRepository.findByProjectId(projectId, limit);
    }

    const query: GetActivityLogsDto = {
      limit,
      page: 1,
      filterType: ActivityFilterType.ALL,
    };

    const { activities } = await this.activityLogRepository.findMany(query);
    return activities;
  }

  async getActivitiesByType(
    type: ActivityType,
    projectId?: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    if (projectId) {
      const query: GetActivityLogsDto = {
        projectId,
        type,
        limit,
        page: 1,
        filterType: ActivityFilterType.ALL,
      };
      const { activities } = await this.activityLogRepository.findMany(query);
      return activities;
    }

    return this.activityLogRepository.findByType(type, limit);
  }

  async getActivitiesByUser(
    userId: string,
    projectId?: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    if (projectId) {
      const query: GetActivityLogsDto = {
        projectId,
        userId,
        limit,
        page: 1,
        filterType: ActivityFilterType.ALL,
      };
      const { activities } = await this.activityLogRepository.findMany(query);
      return activities;
    }

    return this.activityLogRepository.findByUserId(userId, limit);
  }

  async getActivitiesByDateRange(
    startDate: Date,
    endDate: Date,
    projectId?: string,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    if (projectId) {
      const query: GetActivityLogsDto = {
        projectId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit,
        page: 1,
        filterType: ActivityFilterType.ALL,
      };
      const { activities } = await this.activityLogRepository.findMany(query);
      return activities;
    }

    return this.activityLogRepository.findByDateRange(
      startDate,
      endDate,
      limit
    );
  }

  async getEntityActivities(
    entityType: string,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    return this.activityLogRepository.findByEntity(entityType, entityId, limit);
  }

  async getTimelineStatistics(
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
  }> {
    return this.activityLogRepository.getStatistics(
      projectId,
      userId,
      startDate,
      endDate
    );
  }

  async getTimelineSummary(
    projectId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    firstActivity: ActivityLog | null;
    lastActivity: ActivityLog | null;
    duration: number;
    averageActivitiesPerDay: number;
  }> {
    const query: GetActivityLogsDto = {
      projectId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      limit: 1,
      page: 1,
      sortBy: "createdAt",
      sortOrder: "asc",
      filterType: ActivityFilterType.ALL,
    };

    const { activities: firstActivities } =
      await this.activityLogRepository.findMany(query);

    query.sortOrder = "desc";
    const { activities: lastActivities } =
      await this.activityLogRepository.findMany(query);

    const firstActivity = firstActivities[0] || null;
    const lastActivity = lastActivities[0] || null;

    if (!firstActivity || !lastActivity) {
      return {
        firstActivity,
        lastActivity,
        duration: 0,
        averageActivitiesPerDay: 0,
      };
    }

    const duration = Math.ceil(
      (lastActivity.createdAt.getTime() - firstActivity.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const stats = await this.getTimelineStatistics(
      projectId,
      undefined,
      startDate,
      endDate
    );
    const averageActivitiesPerDay =
      duration > 0 ? stats.totalActivities / duration : 0;

    return {
      firstActivity,
      lastActivity,
      duration,
      averageActivitiesPerDay,
    };
  }
}
