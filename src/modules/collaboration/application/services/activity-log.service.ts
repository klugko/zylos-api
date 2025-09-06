import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { GetActivityLogsDto } from "../dto/get-activity-logs.dto";

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: string,
    action: string,
    projectId?: string,
    documentId?: string
  ) {
    // Temporarily disabled to avoid Prisma type issues
    // await this.prisma.partnerActivityLog.create({
    //   data: {
    //     userId,
    //     action: "PROJECT_CREATED" as any,
    //     projectId: projectId ?? null,
    //     documentId: documentId ?? null,
    //   },
    // });
  }

  async getLogs(filter: GetActivityLogsDto) {
    const where: any = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
      if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
    }

    const skip = ((filter.page || 1) - 1) * (filter.limit || 20);
    const take = filter.limit || 20;

    const [logs, total] = await Promise.all([
      this.prisma.partnerActivityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, fullname: true, email: true } },
          project: { select: { id: true, name: true } },
          document: { select: { id: true, name: true } },
        },
      }),
      this.prisma.partnerActivityLog.count({ where }),
    ]);

    return {
      total,
      page: filter.page || 1,
      limit: take,
      data: logs,
    };
  }
}
