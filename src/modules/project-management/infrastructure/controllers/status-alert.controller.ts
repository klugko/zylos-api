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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StatusNotificationService } from "../../application/services/status-notification.service";
import { StatusMonitoringService } from "../../application/services/status-monitoring.service";
import { ResolveStatusAlertDto } from "../../application/dto/status-alert.dto";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";

@ApiTags("Status Alerts")
@ApiBearerAuth("JWT-auth")
@Controller("api/v1/status-alerts")
@UseGuards(JwtAuthGuard)
export class StatusAlertController {
  constructor(
    private readonly statusNotificationService: StatusNotificationService,
    private readonly statusMonitoringService: StatusMonitoringService
  ) {}

  @Get("project/:projectId")
  @ApiOperation({ summary: "Récupérer les alertes d'un projet" })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiQuery({
    name: "unresolvedOnly",
    required: false,
    description: "Afficher seulement les alertes non résolues",
  })
  @ApiResponse({ status: 200, description: "Liste des alertes du projet" })
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
  @ApiOperation({ summary: "Récupérer les alertes d'une tâche" })
  @ApiParam({ name: "taskId", description: "ID de la tâche" })
  @ApiResponse({ status: 200, description: "Liste des alertes de la tâche" })
  async getTaskAlerts(@Param("taskId") taskId: string) {
    return await this.statusNotificationService.getTaskAlerts(taskId);
  }

  @Get("project/:projectId/statistics")
  @ApiOperation({
    summary: "Récupérer les statistiques des alertes d'un projet",
  })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiResponse({ status: 200, description: "Statistiques des alertes" })
  async getAlertStatistics(@Param("projectId") projectId: string) {
    return await this.statusNotificationService.getAlertStatistics(projectId);
  }

  @Get("project/:projectId/status-statistics")
  @ApiOperation({
    summary: "Récupérer les statistiques des statuts d'un projet",
  })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiResponse({ status: 200, description: "Statistiques des statuts" })
  async getStatusStatistics(@Param("projectId") projectId: string) {
    return await this.statusMonitoringService.getStatusStatistics(projectId);
  }

  @Put(":id/resolve")
  @ApiOperation({ summary: "Résoudre une alerte" })
  @ApiParam({ name: "id", description: "ID de l'alerte" })
  @ApiResponse({ status: 200, description: "Alerte résolue avec succès" })
  async resolveAlert(
    @Param("id") id: string,
    @Body() dto: ResolveStatusAlertDto
  ) {
    await this.statusNotificationService.resolveAlert(id);
    return { message: "Alert resolved successfully" };
  }

  @Get("task/:taskId/suggest-status")
  @ApiOperation({ summary: "Suggérer un changement de statut pour une tâche" })
  @ApiParam({ name: "taskId", description: "ID de la tâche" })
  @ApiResponse({
    status: 200,
    description: "Suggestion de changement de statut",
  })
  async suggestStatusChange(@Param("taskId") taskId: string) {
    const suggestedStatusId =
      await this.statusMonitoringService.suggestStatusChange(taskId);
    return { suggestedStatusId };
  }

  @Post("project/:projectId/force-monitoring")
  @ApiOperation({
    summary: "Forcer le monitoring des statuts (pour les tests)",
  })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiResponse({ status: 200, description: "Monitoring forcé avec succès" })
  async forceMonitoring(@Param("projectId") projectId: string) {
    await this.statusMonitoringService.monitorStatusDurations();
    return { message: "Monitoring forcé avec succès" };
  }
}
