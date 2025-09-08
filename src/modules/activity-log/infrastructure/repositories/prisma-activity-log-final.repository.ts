import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { ActivityLogRepository } from "../../domain/interfaces/activity-log-repository.interface";
import { ActivityLog } from "../../domain/entities/activity-log.entity";
import { GetActivityLogsDto } from "../../application/dto/get-activity-logs.dto";
import {
  ActivityType,
  ActivityAction,
} from "../../domain/enums/activity.enums";

@Injectable()
export class PrismaActivityLogFinalRepository implements ActivityLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(activityLog: ActivityLog): Promise<ActivityLog> {
    const created = await this.prisma.partnerActivityLog.create({
      data: {
        userId: activityLog.userId,
        projectId: activityLog.projectId,
        taskId: activityLog.taskId,
        documentId: activityLog.documentId,
        surveyId: activityLog.surveyId,
        type: activityLog.type,
        action: activityLog.action,
        title: activityLog.title,
        description: activityLog.description,
        metadata: activityLog.metadata,
        ipAddress: activityLog.ipAddress,
        userAgent: activityLog.userAgent,
      },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<ActivityLog | null> {
    const activity = await this.prisma.partnerActivityLog.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activity ? this.mapToEntity(activity) : null;
  }

  async findMany(
    query: GetActivityLogsDto
  ): Promise<{ activities: ActivityLog[]; total: number }> {
    const where: any = {};

    // Apply filters
    if (query.userId) where.userId = query.userId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.taskId) where.taskId = query.taskId;
    if (query.documentId) where.documentId = query.documentId;
    if (query.surveyId) where.surveyId = query.surveyId;
    if (query.type) {
      where.type = query.type;
    }
    if (query.actions && query.actions.length > 0) {
      where.action = { in: query.actions };
    }

    // Date range filter
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    // Text search
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { action: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Pagination
    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;

    // Sorting
    const orderBy: any = {};
    orderBy[query.sortBy || "createdAt"] = query.sortOrder || "desc";

    const [activities, total] = await Promise.all([
      this.prisma.partnerActivityLog.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          user: { select: { id: true, fullname: true, email: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
          document: { select: { id: true, name: true } },
          survey: { select: { id: true, title: true } },
        },
      }),
      this.prisma.partnerActivityLog.count({ where }),
    ]);

    return {
      activities: activities.map((activity) => this.mapToEntity(activity)),
      total,
    };
  }

  async findByProjectId(
    projectId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    const activities = await this.prisma.partnerActivityLog.findMany({
      where: { projectId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async findByUserId(
    userId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    const activities = await this.prisma.partnerActivityLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async findByType(
    type: ActivityType,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    const activities = await this.prisma.partnerActivityLog.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async findByAction(
    action: ActivityAction,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    const activities = await this.prisma.partnerActivityLog.findMany({
      where: { action },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 50
  ): Promise<ActivityLog[]> {
    const activities = await this.prisma.partnerActivityLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> {
    const where: any = {};

    switch (entityType.toLowerCase()) {
      case "project":
        where.projectId = entityId;
        break;
      case "task":
        where.taskId = entityId;
        break;
      case "document":
        where.documentId = entityId;
        break;
      case "survey":
        where.surveyId = entityId;
        break;
      default:
        throw new Error(`Entity type ${entityType} not supported`);
    }

    const activities = await this.prisma.partnerActivityLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, fullname: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        document: { select: { id: true, name: true } },
        survey: { select: { id: true, title: true } },
      },
    });

    return activities.map((activity) => this.mapToEntity(activity));
  }

  async getStatistics(
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
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const activities = await this.prisma.partnerActivityLog.findMany({
      where,
      select: {
        type: true,
        action: true,
        userId: true,
        createdAt: true,
      },
    });

    const activitiesByType: Record<ActivityType, number> = {} as Record<
      ActivityType,
      number
    >;
    const activitiesByUser: Record<string, number> = {};
    const activitiesByDay: Record<string, number> = {};

    activities.forEach((activity) => {
      activitiesByType[activity.type] =
        (activitiesByType[activity.type] || 0) + 1;

      activitiesByUser[activity.userId] =
        (activitiesByUser[activity.userId] || 0) + 1;

      const dateKey = activity.createdAt.toISOString().split("T")[0];
      activitiesByDay[dateKey] = (activitiesByDay[dateKey] || 0) + 1;
    });

    const mostActiveDay = Object.entries(activitiesByDay).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    const mostActiveUser = Object.entries(activitiesByUser).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    return {
      totalActivities: activities.length,
      activitiesByType,
      activitiesByUser,
      activitiesByDay,
      mostActiveDay,
      mostActiveUser,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.partnerActivityLog.delete({ where: { id } });
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await this.prisma.partnerActivityLog.deleteMany({ where: { projectId } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.partnerActivityLog.deleteMany({ where: { userId } });
  }

  async deleteOldLogs(olderThan: Date): Promise<number> {
    const result = await this.prisma.partnerActivityLog.deleteMany({
      where: { createdAt: { lt: olderThan } },
    });
    return result.count;
  }

  private mapToEntity(data: any): ActivityLog {
    return new ActivityLog(
      data.id,
      data.userId,
      data.projectId,
      data.taskId,
      data.documentId,
      data.surveyId,
      data.type,
      data.action,
      data.title,
      data.description,
      data.metadata,
      data.ipAddress,
      data.userAgent,
      data.createdAt
    );
  }
}
