import {
  ActivityType,
  ActivityAction,
} from "../../domain/enums/activity.enums";

export class ActivityLogResponseDto {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  documentId?: string;
  surveyId?: string;
  type: ActivityType;
  action: ActivityAction;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;

  user?: {
    id: string;
    fullname: string;
    email: string;
    avatar?: string;
  };

  project?: {
    id: string;
    name: string;
  };

  task?: {
    id: string;
    title: string;
  };

  document?: {
    id: string;
    name: string;
  };

  survey?: {
    id: string;
    title: string;
  };

  relativeTime?: string;
  changes?: Record<string, { old: any; new: any }>;
  isProjectRelated?: boolean;
  isTaskRelated?: boolean;
  isDocumentRelated?: boolean;
  isSurveyRelated?: boolean;
  isUserAction?: boolean;
  isSystemAction?: boolean;
}

export class ActivityTimelineResponseDto {
  projectId?: string;
  activities: ActivityLogResponseDto[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;

  statistics?: {
    totalActivities: number;
    activitiesByType: Record<ActivityType, number>;
    activitiesByUser: Record<string, number>;
    mostActiveDay?: string;
    mostActiveUser?: string;
  };

  timelineSummary?: {
    firstActivity?: ActivityLogResponseDto;
    lastActivity?: ActivityLogResponseDto;
    duration: number;
    averageActivitiesPerDay: number;
  };

  groupedByDay?: Record<string, ActivityLogResponseDto[]>;
  groupedByType?: Record<ActivityType, ActivityLogResponseDto[]>;
}

export class ActivityExportResponseDto {
  filename: string;
  format: string;
  downloadUrl: string;
  expiresAt: Date;
  fileSize: number;
  recordCount: number;
}
