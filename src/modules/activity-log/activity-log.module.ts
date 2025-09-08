import { Module } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { PrismaActivityLogFinalRepository } from "./infrastructure/repositories/prisma-activity-log-final.repository";
import { ActivityTimelineService } from "./application/services/activity-timeline.service";
import { ActivityLoggerService } from "./application/services/activity-logger.service";
import { GetActivityLogsUseCase } from "./application/use-cases/get-activity-logs.use-case";
import { ExportActivityLogsUseCase } from "./application/use-cases/export-activity-logs.use-case";
import { ActivityLogController } from "./infrastructure/controllers/activity-log.controller";

@Module({
  providers: [
    PrismaService,
    {
      provide: "ActivityLogRepository",
      useClass: PrismaActivityLogFinalRepository,
    },
    ActivityTimelineService,
    ActivityLoggerService,
    GetActivityLogsUseCase,
    ExportActivityLogsUseCase,
  ],
  controllers: [ActivityLogController],
  exports: [
    ActivityLoggerService,
    ActivityTimelineService,
    "ActivityLogRepository",
  ],
})
export class ActivityLogModule {}
