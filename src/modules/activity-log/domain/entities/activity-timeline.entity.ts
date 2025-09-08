import { ActivityLog } from "./activity-log.entity";
import { ActivityType } from "../enums/activity.enums";

export class ActivityTimeline {
  constructor(
    public readonly projectId: string | null,
    public readonly activities: ActivityLog[],
    public readonly totalCount: number,
    public readonly hasMore: boolean
  ) {}

  public getActivitiesByType(type: ActivityType): ActivityLog[] {
    return this.activities.filter((activity) => activity.type === type);
  }

  public getActivitiesByUser(userId: string): ActivityLog[] {
    return this.activities.filter((activity) => activity.userId === userId);
  }

  public getRecentActivities(limit: number = 10): ActivityLog[] {
    return this.activities.slice(0, limit);
  }

  public getActivitiesByDateRange(
    startDate: Date,
    endDate: Date
  ): ActivityLog[] {
    return this.activities.filter(
      (activity) =>
        activity.createdAt >= startDate && activity.createdAt <= endDate
    );
  }

  public getActivitiesByDay(date: Date): ActivityLog[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getActivitiesByDateRange(startOfDay, endOfDay);
  }

  public getGroupedByDay(): Record<string, ActivityLog[]> {
    const grouped: Record<string, ActivityLog[]> = {};

    this.activities.forEach((activity) => {
      const dateKey = activity.createdAt.toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return grouped;
  }

  public getGroupedByType(): Record<ActivityType, ActivityLog[]> {
    const grouped: Record<ActivityType, ActivityLog[]> = {} as Record<
      ActivityType,
      ActivityLog[]
    >;

    this.activities.forEach((activity) => {
      if (!grouped[activity.type]) {
        grouped[activity.type] = [];
      }
      grouped[activity.type].push(activity);
    });

    return grouped;
  }

  public getStatistics(): {
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesByUser: Record<string, number>;
    mostActiveDay: string | null;
    mostActiveUser: string | null;
  } {
    const activitiesByType: Record<ActivityType, number> = {} as Record<
      ActivityType,
      number
    >;
    const activitiesByUser: Record<string, number> = {};
    const activitiesByDay: Record<string, number> = {};

    this.activities.forEach((activity) => {
      activitiesByType[activity.type] =
        (activitiesByType[activity.type] || 0) + 1;

      activitiesByUser[activity.userId] =
        (activitiesByUser[activity.userId] || 0) + 1;

      const dateKey = activity.createdAt.toISOString().split("T")[0];
      activitiesByDay[dateKey] = (activitiesByDay[dateKey] || 0) + 1;
    });

    const mostActiveDay =
      Object.entries(activitiesByDay).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      null;

    const mostActiveUser =
      Object.entries(activitiesByUser).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      null;

    return {
      totalActivities: this.totalCount,
      activitiesByType,
      activitiesByUser,
      mostActiveDay,
      mostActiveUser,
    };
  }

  public getTimelineSummary(): {
    firstActivity: ActivityLog | null;
    lastActivity: ActivityLog | null;
    duration: number;
    averageActivitiesPerDay: number;
  } {
    if (this.activities.length === 0) {
      return {
        firstActivity: null,
        lastActivity: null,
        duration: 0,
        averageActivitiesPerDay: 0,
      };
    }

    const sortedActivities = [...this.activities].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const firstActivity = sortedActivities[0];
    const lastActivity = sortedActivities[sortedActivities.length - 1];

    const duration = Math.ceil(
      (lastActivity.createdAt.getTime() - firstActivity.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const averageActivitiesPerDay =
      duration > 0 ? this.activities.length / duration : 0;

    return {
      firstActivity,
      lastActivity,
      duration,
      averageActivitiesPerDay,
    };
  }
}
