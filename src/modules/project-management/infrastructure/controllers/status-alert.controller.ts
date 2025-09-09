import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { StatusNotificationService } from "../../application/services/status-notification.service";
import { StatusMonitoringService } from "../../application/services/status-monitoring.service";
import { ResolveStatusAlertDto } from "../../application/dto/status-alert.dto";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";

@Controller("api/v1/status-alerts")
@UseGuards(JwtAuthGuard)
export class StatusAlertController {
  constructor(
    private readonly statusNotificationService: StatusNotificationService,
    private readonly statusMonitoringService: StatusMonitoringService
  ) {}

  @Get("project/:projectId")
  async getProjectAlerts(
    @Param("projectId") projectId: string,
    @Query("unresolvedOnly") unresolvedOnly?: string
  ) {
    const unresolvedOnlyBool = unresolvedOnly === "true";
    return await this.statusNotificationService.getProjectAlerts(
      projectId,
      unresolvedOnlyBool
    );
  }

  @Get("task/:taskId")
  async getTaskAlerts(@Param("taskId") taskId: string) {
    return await this.statusNotificationService.getTaskAlerts(taskId);
  }

  @Get("project/:projectId/statistics")
  async getAlertStatistics(@Param("projectId") projectId: string) {
    return await this.statusNotificationService.getAlertStatistics(projectId);
  }

  @Get("project/:projectId/status-statistics")
  async getStatusStatistics(@Param("projectId") projectId: string) {
    return await this.statusMonitoringService.getStatusStatistics(projectId);
  }

  @Put(":id/resolve")
  async resolveAlert(
    @Param("id") id: string,
    @Body() dto: ResolveStatusAlertDto
  ) {
    await this.statusNotificationService.resolveAlert(id);
    return { message: "Alert resolved successfully" };
  }

  @Get("task/:taskId/suggest-status")
  async suggestStatusChange(@Param("taskId") taskId: string) {
    const suggestedStatusId =
      await this.statusMonitoringService.suggestStatusChange(taskId);
    return { suggestedStatusId };
  }
}
