import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { IStatusDurationRepository } from "../../domain/interfaces/status-duration-repository.interface";
import { StatusDuration } from "../../domain/entities/status-duration.entity";

@Injectable()
export class StatusDurationRepository implements IStatusDurationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(statusDuration: StatusDuration): Promise<StatusDuration> {
    const created = await this.prisma.statusDuration.create({
      data: {
        id: statusDuration.id,
        taskId: statusDuration.taskId,
        customStatusId: statusDuration.customStatusId,
        projectId: statusDuration.projectId,
        startDate: statusDuration.startDate,
        endDate: statusDuration.endDate,
        duration: statusDuration.duration,
        createdAt: statusDuration.createdAt,
        updatedAt: statusDuration.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async findByTaskId(taskId: string): Promise<StatusDuration[]> {
    const found = await this.prisma.statusDuration.findMany({
      where: { taskId },
      orderBy: { startDate: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findByCustomStatusId(
    customStatusId: string
  ): Promise<StatusDuration[]> {
    const found = await this.prisma.statusDuration.findMany({
      where: { customStatusId },
      orderBy: { startDate: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findByProjectId(projectId: string): Promise<StatusDuration[]> {
    const found = await this.prisma.statusDuration.findMany({
      where: { projectId },
      orderBy: { startDate: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findActiveByTaskId(taskId: string): Promise<StatusDuration | null> {
    const found = await this.prisma.statusDuration.findFirst({
      where: { taskId, endDate: null },
    });

    return found ? this.toDomain(found) : null;
  }

  async update(statusDuration: StatusDuration): Promise<StatusDuration> {
    const updated = await this.prisma.statusDuration.update({
      where: { id: statusDuration.id },
      data: {
        endDate: statusDuration.endDate,
        duration: statusDuration.duration,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async getAverageDurationByStatus(customStatusId: string): Promise<number> {
    const result = await this.prisma.statusDuration.aggregate({
      where: {
        customStatusId,
        endDate: { not: null },
      },
      _avg: { duration: true },
    });

    return result._avg.duration
      ? result._avg.duration / (1000 * 60 * 60 * 24)
      : 0;
  }

  async getDurationStatistics(customStatusId: string): Promise<{
    average: number;
    median: number;
    standardDeviation: number;
    count: number;
  }> {
    const durations = await this.prisma.statusDuration.findMany({
      where: {
        customStatusId,
        endDate: { not: null },
      },
      select: { duration: true },
    });

    if (durations.length === 0) {
      return { average: 0, median: 0, standardDeviation: 0, count: 0 };
    }

    const durationsInDays = durations.map(
      (d) => d.duration / (1000 * 60 * 60 * 24)
    );
    const sorted = durationsInDays.sort((a, b) => a - b);

    const average =
      durationsInDays.reduce((sum, d) => sum + d, 0) / durationsInDays.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    const variance =
      durationsInDays.reduce((sum, d) => sum + Math.pow(d - average, 2), 0) /
      durationsInDays.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      average,
      median,
      standardDeviation,
      count: durations.length,
    };
  }

  private toDomain(prismaStatusDuration: any): StatusDuration {
    return new StatusDuration(
      prismaStatusDuration.id,
      prismaStatusDuration.taskId,
      prismaStatusDuration.customStatusId,
      prismaStatusDuration.projectId,
      prismaStatusDuration.startDate,
      prismaStatusDuration.endDate,
      prismaStatusDuration.duration,
      prismaStatusDuration.createdAt,
      prismaStatusDuration.updatedAt
    );
  }
}
