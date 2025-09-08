import { StatusDuration } from "../entities/status-duration.entity";

export interface IStatusDurationRepository {
  create(statusDuration: StatusDuration): Promise<StatusDuration>;
  findByTaskId(taskId: string): Promise<StatusDuration[]>;
  findByCustomStatusId(customStatusId: string): Promise<StatusDuration[]>;
  findByProjectId(projectId: string): Promise<StatusDuration[]>;
  findActiveByTaskId(taskId: string): Promise<StatusDuration | null>;
  update(statusDuration: StatusDuration): Promise<StatusDuration>;
  getAverageDurationByStatus(customStatusId: string): Promise<number>;
  getDurationStatistics(customStatusId: string): Promise<{
    average: number;
    median: number;
    standardDeviation: number;
    count: number;
  }>;
}
