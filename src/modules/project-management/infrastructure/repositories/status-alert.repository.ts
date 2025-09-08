import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { IStatusAlertRepository } from "../../domain/interfaces/status-alert-repository.interface";
import {
  StatusAlert,
  AlertType,
  AlertSeverity,
} from "../../domain/entities/status-alert.entity";

@Injectable()
export class StatusAlertRepository implements IStatusAlertRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(statusAlert: StatusAlert): Promise<StatusAlert> {
    const created = await this.prisma.statusAlert.create({
      data: {
        id: statusAlert.id,
        taskId: statusAlert.taskId,
        projectId: statusAlert.projectId,
        customStatusId: statusAlert.customStatusId,
        type: statusAlert.type,
        severity: statusAlert.severity,
        message: statusAlert.message,
        suggestedStatusId: statusAlert.suggestedStatusId,
        isResolved: statusAlert.isResolved,
        resolvedAt: statusAlert.resolvedAt,
        createdAt: statusAlert.createdAt,
      },
    });

    return this.toDomain(created);
  }

  async findByTaskId(taskId: string): Promise<StatusAlert[]> {
    const found = await this.prisma.statusAlert.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findByProjectId(projectId: string): Promise<StatusAlert[]> {
    const found = await this.prisma.statusAlert.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findUnresolvedByProjectId(projectId: string): Promise<StatusAlert[]> {
    const found = await this.prisma.statusAlert.findMany({
      where: { projectId, isResolved: false },
      orderBy: { createdAt: "desc" },
    });

    return found.map(this.toDomain);
  }

  async findByType(type: AlertType): Promise<StatusAlert[]> {
    const found = await this.prisma.statusAlert.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
    });

    return found.map(this.toDomain);
  }

  async update(statusAlert: StatusAlert): Promise<StatusAlert> {
    const updated = await this.prisma.statusAlert.update({
      where: { id: statusAlert.id },
      data: {
        type: statusAlert.type,
        severity: statusAlert.severity,
        message: statusAlert.message,
        suggestedStatusId: statusAlert.suggestedStatusId,
        isResolved: statusAlert.isResolved,
        resolvedAt: statusAlert.resolvedAt,
      },
    });

    return this.toDomain(updated);
  }

  async resolve(id: string): Promise<void> {
    await this.prisma.statusAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.statusAlert.delete({
      where: { id },
    });
  }

  private toDomain(prismaStatusAlert: any): StatusAlert {
    return new StatusAlert(
      prismaStatusAlert.id,
      prismaStatusAlert.taskId,
      prismaStatusAlert.projectId,
      prismaStatusAlert.customStatusId,
      prismaStatusAlert.type,
      prismaStatusAlert.severity,
      prismaStatusAlert.message,
      prismaStatusAlert.suggestedStatusId,
      prismaStatusAlert.isResolved,
      prismaStatusAlert.createdAt,
      prismaStatusAlert.resolvedAt
    );
  }
}
