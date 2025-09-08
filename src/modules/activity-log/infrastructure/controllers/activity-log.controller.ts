import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";
import { CurrentUser } from "@core/common/current-user.decorator";
import { User } from "@modules/auth/domain/entities/user.entity";
import { GetActivityLogsUseCase } from "../../application/use-cases/get-activity-logs.use-case";
import { ExportActivityLogsUseCase } from "../../application/use-cases/export-activity-logs.use-case";
import { PrismaService } from "@core/prisma/prisma.service";
import { GetActivityLogsDto } from "../../application/dto/get-activity-logs.dto";
import { ExportActivityLogsDto } from "../../application/dto/export-activity-logs.dto";
import {
  ActivityTimelineResponseDto,
  ActivityExportResponseDto,
} from "../../application/dto/activity-log-response.dto";

@ApiTags("Fil d'Activité")
@Controller("api/v1/activity-logs")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class ActivityLogController {
  constructor(
    private readonly getActivityLogsUseCase: GetActivityLogsUseCase,
    private readonly exportActivityLogsUseCase: ExportActivityLogsUseCase,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: "Récupérer le fil d'activité" })
  @ApiResponse({
    status: 200,
    description: "Fil d'activité récupéré avec succès",
  })
  @ApiQuery({ name: "projectId", required: false, description: "ID du projet" })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "ID de l'utilisateur",
  })
  @ApiQuery({ name: "type", required: false, description: "Type d'activité" })
  @ApiQuery({
    name: "actions",
    required: false,
    description: "Actions spécifiques",
  })
  @ApiQuery({
    name: "filterType",
    required: false,
    description: "Type de filtre",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Recherche textuelle",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Date de début",
  })
  @ApiQuery({ name: "endDate", required: false, description: "Date de fin" })
  @ApiQuery({ name: "page", required: false, description: "Numéro de page" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre d'éléments par page",
  })
  @ApiQuery({
    name: "groupBy",
    required: false,
    description: "Grouper par (day, type, user, none)",
  })
  async getActivityLogs(
    @Query() query: GetActivityLogsDto,
    @CurrentUser() user: User
  ): Promise<ActivityTimelineResponseDto> {
    return this.getActivityLogsUseCase.execute(query);
  }

  @Get("project/:projectId")
  @ApiOperation({ summary: "Récupérer le fil d'activité d'un projet" })
  @ApiResponse({
    status: 200,
    description: "Fil d'activité du projet récupéré avec succès",
  })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiQuery({ name: "type", required: false, description: "Type d'activité" })
  @ApiQuery({
    name: "actions",
    required: false,
    description: "Actions spécifiques",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Recherche textuelle",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Date de début",
  })
  @ApiQuery({ name: "endDate", required: false, description: "Date de fin" })
  @ApiQuery({ name: "page", required: false, description: "Numéro de page" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre d'éléments par page",
  })
  @ApiQuery({
    name: "groupBy",
    required: false,
    description: "Grouper par (day, type, user, none)",
  })
  async getProjectActivityLogs(
    @Param("projectId") projectId: string,
    @Query() query: Omit<GetActivityLogsDto, "projectId">,
    @CurrentUser() user: User
  ): Promise<ActivityTimelineResponseDto> {
    const fullQuery: GetActivityLogsDto = { ...query, projectId };
    return this.getActivityLogsUseCase.execute(fullQuery);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Récupérer le fil d'activité d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Fil d'activité de l'utilisateur récupéré avec succès",
  })
  @ApiParam({ name: "userId", description: "ID de l'utilisateur" })
  @ApiQuery({ name: "projectId", required: false, description: "ID du projet" })
  @ApiQuery({ name: "type", required: false, description: "Type d'activité" })
  @ApiQuery({
    name: "actions",
    required: false,
    description: "Actions spécifiques",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Recherche textuelle",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Date de début",
  })
  @ApiQuery({ name: "endDate", required: false, description: "Date de fin" })
  @ApiQuery({ name: "page", required: false, description: "Numéro de page" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre d'éléments par page",
  })
  @ApiQuery({
    name: "groupBy",
    required: false,
    description: "Grouper par (day, type, user, none)",
  })
  async getUserActivityLogs(
    @Param("userId") userId: string,
    @Query() query: Omit<GetActivityLogsDto, "userId">,
    @CurrentUser() user: User
  ): Promise<ActivityTimelineResponseDto> {
    const fullQuery: GetActivityLogsDto = { ...query, userId };
    return this.getActivityLogsUseCase.execute(fullQuery);
  }

  @Get("recent")
  @ApiOperation({ summary: "Récupérer les activités récentes" })
  @ApiResponse({
    status: 200,
    description: "Activités récentes récupérées avec succès",
  })
  @ApiQuery({ name: "projectId", required: false, description: "ID du projet" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre d'éléments (défaut: 10)",
  })
  async getRecentActivities(
    @CurrentUser() user: User,
    @Query("projectId") projectId?: string,
    @Query("limit") limit?: number
  ): Promise<ActivityTimelineResponseDto> {
    const query: GetActivityLogsDto = {
      projectId,
      limit: limit || 10,
      page: 1,
      filterType: "ALL" as any,
    };
    return this.getActivityLogsUseCase.execute(query);
  }

  @Post("export")
  @ApiOperation({ summary: "Exporter le fil d'activité" })
  @ApiResponse({ status: 200, description: "Export généré avec succès" })
  @ApiResponse({ status: 400, description: "Données d'export invalides" })
  async exportActivityLogs(
    @Body() dto: ExportActivityLogsDto,
    @CurrentUser() user: User
  ): Promise<ActivityExportResponseDto> {
    return this.exportActivityLogsUseCase.execute(dto);
  }

  @Get("download/:timestamp/:filename")
  @ApiOperation({ summary: "Télécharger un fichier d'export" })
  @ApiResponse({ status: 200, description: "Fichier téléchargé avec succès" })
  @ApiResponse({ status: 404, description: "Fichier introuvable" })
  @ApiParam({ name: "timestamp", description: "Timestamp du fichier" })
  @ApiParam({ name: "filename", description: "Nom du fichier" })
  async downloadExport(
    @Param("timestamp") timestamp: string,
    @Param("filename") filename: string,
    @Res() res: Response,
    @CurrentUser() user: User
  ): Promise<void> {
    res.status(HttpStatus.NOT_IMPLEMENTED).json({
      message: "Téléchargement d'export non encore implémenté",
      timestamp,
      filename,
    });
  }

  @Get("statistics")
  @ApiOperation({ summary: "Récupérer les statistiques d'activité" })
  @ApiResponse({
    status: 200,
    description: "Statistiques récupérées avec succès",
  })
  @ApiQuery({ name: "projectId", required: false, description: "ID du projet" })
  @ApiQuery({
    name: "userId",
    required: false,
    description: "ID de l'utilisateur",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    description: "Date de début",
  })
  @ApiQuery({ name: "endDate", required: false, description: "Date de fin" })
  async getStatistics(
    @CurrentUser() user: User,
    @Query("projectId") projectId?: string,
    @Query("userId") userId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ): Promise<any> {
    const query: GetActivityLogsDto = {
      projectId,
      userId,
      startDate,
      endDate,
      limit: 1,
      page: 1,
      groupBy: "type",
      filterType: "ALL" as any,
    };

    const result = await this.getActivityLogsUseCase.execute(query);
    return result.statistics;
  }

  @Post("seed")
  @ApiOperation({ summary: "Créer des données de test pour le fil d'activité" })
  @ApiResponse({
    status: 201,
    description: "Données de test créées avec succès",
  })
  async seedSampleActivities(): Promise<{ message: string; count: number }> {
    const user = await this.prisma.user.findFirst();
    const project = await this.prisma.project.findFirst();

    if (!user || !project) {
      throw new Error("No user or project found for seeding");
    }

    const activities = [
      {
        userId: user.id,
        projectId: project.id,
        type: "PROJECT" as any,
        action: "PROJECT_CREATED" as any,
        title: `Projet "${project.name}" créé`,
        description: `Un nouveau projet a été créé : ${project.name}`,
        metadata: {
          projectName: project.name,
          timestamp: new Date().toISOString(),
        },
      },
      {
        userId: user.id,
        projectId: project.id,
        type: "USER" as any,
        action: "USER_LOGGED_IN" as any,
        title: "Connexion utilisateur",
        description: "Un utilisateur s'est connecté au système",
        metadata: {
          userEmail: user.email,
          timestamp: new Date().toISOString(),
        },
      },
      {
        userId: user.id,
        projectId: project.id,
        type: "DOCUMENT" as any,
        action: "DOCUMENT_UPLOADED" as any,
        title: "Document uploadé",
        description: `Un nouveau document a été uploadé dans le projet "${project.name}"`,
        metadata: {
          projectName: project.name,
          timestamp: new Date().toISOString(),
        },
      },
      {
        userId: user.id,
        projectId: project.id,
        type: "SURVEY" as any,
        action: "SURVEY_CREATED" as any,
        title: "Sondage créé",
        description: `Un nouveau sondage a été créé dans le projet "${project.name}"`,
        metadata: {
          projectName: project.name,
          timestamp: new Date().toISOString(),
        },
      },
      {
        userId: user.id,
        projectId: project.id,
        type: "PROJECT" as any,
        action: "PROJECT_UPDATED" as any,
        title: `Projet "${project.name}" modifié`,
        description: `Le projet "${project.name}" a été modifié`,
        metadata: {
          projectName: project.name,
          timestamp: new Date().toISOString(),
        },
      },
    ];

    for (const activity of activities) {
      await this.prisma.partnerActivityLog.create({
        data: activity,
      });
    }

    return {
      message: "Sample activities created successfully with real data!",
      count: activities.length,
    };
  }
}
