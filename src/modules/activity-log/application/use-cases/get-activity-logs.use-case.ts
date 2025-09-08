import { Injectable, Inject } from "@nestjs/common";
import { ActivityLogRepository } from "../../domain/interfaces/activity-log-repository.interface";
import { ActivityTimelineService } from "../services/activity-timeline.service";
import { GetActivityLogsDto } from "../dto/get-activity-logs.dto";
import { ActivityTimelineResponseDto } from "../dto/activity-log-response.dto";
import { ActivityLogResponseDto } from "../dto/activity-log-response.dto";
import { ActivityFilterType } from "../../domain/enums/activity.enums";

@Injectable()
export class GetActivityLogsUseCase {
  constructor(
    @Inject("ActivityLogRepository")
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly timelineService: ActivityTimelineService
  ) {}

  async execute(
    query: GetActivityLogsDto
  ): Promise<ActivityTimelineResponseDto> {
    let timeline;

    // Determine which timeline to get based on query parameters
    if (query.projectId) {
      timeline = await this.timelineService.getProjectTimeline(
        query.projectId,
        query
      );
    } else if (query.userId) {
      timeline = await this.timelineService.getUserTimeline(
        query.userId,
        query
      );
    } else {
      timeline = await this.timelineService.getFilteredTimeline(query);
    }

    const activities: ActivityLogResponseDto[] = timeline.activities.map(
      (activity) => this.mapToResponseDto(activity)
    );

    let statistics;
    if (query.groupBy !== "none") {
      statistics = timeline.getStatistics();
    }

    let timelineSummary;
    if (query.projectId) {
      timelineSummary = await this.timelineService.getTimelineSummary(
        query.projectId,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined
      );
    }

    let groupedByDay;
    let groupedByType;
    if (query.groupBy === "day") {
      groupedByDay = timeline.getGroupedByDay();
    } else if (query.groupBy === "type") {
      groupedByType = timeline.getGroupedByType();
    }

    return {
      projectId: timeline.projectId,
      activities,
      totalCount: timeline.totalCount,
      hasMore: timeline.hasMore,
      page: query.page || 1,
      limit: query.limit || 20,
      statistics,
      timelineSummary,
      groupedByDay,
      groupedByType,
    };
  }

  private mapToResponseDto(activity: any): ActivityLogResponseDto {
    return {
      id: activity.id,
      userId: activity.userId,
      projectId: activity.projectId,
      taskId: activity.taskId,
      documentId: activity.documentId,
      surveyId: activity.surveyId,
      type: activity.type,
      action: activity.action,
      title: activity.title,
      description: activity.description,
      metadata: activity.metadata,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      createdAt: activity.createdAt,

      relativeTime:
        activity.getRelativeTime?.() ||
        this.getRelativeTime(activity.createdAt),
      changes: activity.getChanges?.() || this.getChanges(activity.metadata),
      isProjectRelated: activity.isProjectRelated?.() || !!activity.projectId,
      isTaskRelated: activity.isTaskRelated?.() || !!activity.taskId,
      isDocumentRelated:
        activity.isDocumentRelated?.() || !!activity.documentId,
      isSurveyRelated: activity.isSurveyRelated?.() || !!activity.surveyId,
      isUserAction: activity.isUserAction?.() || activity.type === "USER",
      isSystemAction: activity.isSystemAction?.() || activity.type === "SYSTEM",
    };
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Il y a quelques secondes";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  }

  private getChanges(metadata: any): Record<string, { old: any; new: any }> {
    if (!metadata?.changes) return {};
    return metadata.changes;
  }
}
