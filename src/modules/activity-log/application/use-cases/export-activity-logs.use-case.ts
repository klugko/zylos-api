import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { ActivityLogRepository } from "../../domain/interfaces/activity-log-repository.interface";
import { ActivityTimelineService } from "../services/activity-timeline.service";
import { ExportActivityLogsDto } from "../dto/export-activity-logs.dto";
import { ActivityExportResponseDto } from "../dto/activity-log-response.dto";
import { ActivityExportFormat } from "../../domain/enums/activity.enums";
import { GetActivityLogsDto } from "../dto/get-activity-logs.dto";

@Injectable()
export class ExportActivityLogsUseCase {
  constructor(
    @Inject("ActivityLogRepository")
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly timelineService: ActivityTimelineService
  ) {}

  async execute(
    dto: ExportActivityLogsDto
  ): Promise<ActivityExportResponseDto> {
    // Convert export DTO to query DTO
    const query: GetActivityLogsDto = {
      projectId: dto.projectId,
      userId: dto.userId,
      type: dto.type,
      actions: dto.actions,
      filterType: dto.filterType,
      search: dto.search,
      startDate: dto.startDate,
      endDate: dto.endDate,
      limit: 10000, // Large limit for export
      page: 1,
      groupBy: dto.groupBy,
    };

    // Get activities
    const timeline = await this.timelineService.getFilteredTimeline(query);

    if (timeline.activities.length === 0) {
      throw new BadRequestException("Aucune activité trouvée pour l'export");
    }

    // Generate filename
    const filename = this.generateFilename(dto);

    // Export based on format
    let downloadUrl: string;
    let fileSize: number;

    switch (dto.format) {
      case ActivityExportFormat.CSV:
        const csvData = this.generateCSV(timeline.activities, dto);
        downloadUrl = await this.saveFile(csvData, filename, "csv");
        fileSize = Buffer.byteLength(csvData, "utf8");
        break;

      case ActivityExportFormat.PDF:
        const pdfData = await this.generatePDF(timeline.activities, dto);
        downloadUrl = await this.saveFile(pdfData, filename, "pdf");
        fileSize = pdfData.length;
        break;

      case ActivityExportFormat.JSON:
        const jsonData = this.generateJSON(timeline.activities, dto);
        downloadUrl = await this.saveFile(jsonData, filename, "json");
        fileSize = Buffer.byteLength(jsonData, "utf8");
        break;

      default:
        throw new BadRequestException("Format d'export non supporté");
    }

    // Set expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      filename,
      format: dto.format,
      downloadUrl,
      expiresAt,
      fileSize,
      recordCount: timeline.activities.length,
    };
  }

  private generateFilename(dto: ExportActivityLogsDto): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const projectSuffix = dto.projectId ? `_project_${dto.projectId}` : "";
    const userSuffix = dto.userId ? `_user_${dto.userId}` : "";

    return (
      dto.filename ||
      `activity_logs${projectSuffix}${userSuffix}_${timestamp}.${dto.format.toLowerCase()}`
    );
  }

  private generateCSV(activities: any[], dto: ExportActivityLogsDto): string {
    const headers = [
      "ID",
      "Date",
      "Utilisateur",
      "Type",
      "Action",
      "Titre",
      "Description",
      "Projet",
      "Tâche",
      "Document",
      "Sondage",
    ];

    if (dto.includeMetadata) {
      headers.push("Métadonnées");
    }

    const rows = activities.map((activity) => {
      const row = [
        activity.id,
        activity.createdAt.toISOString(),
        activity.user?.fullname || activity.userId,
        activity.type,
        activity.action,
        activity.title,
        activity.description || "",
        activity.project?.name || "",
        activity.task?.title || "",
        activity.document?.name || "",
        activity.survey?.title || "",
      ];

      if (dto.includeMetadata) {
        row.push(JSON.stringify(activity.metadata || {}));
      }

      return row;
    });

    // Escape CSV values
    const escapedRows = rows.map((row) =>
      row.map((cell) => {
        const str = String(cell || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
    );

    return [headers, ...escapedRows].map((row) => row.join(",")).join("\n");
  }

  private generateJSON(activities: any[], dto: ExportActivityLogsDto): string {
    const exportData = {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        format: dto.format,
        recordCount: activities.length,
        filters: {
          projectId: dto.projectId,
          userId: dto.userId,
          type: dto.type,
          actions: dto.actions,
          startDate: dto.startDate,
          endDate: dto.endDate,
        },
      },
      activities: activities.map((activity) => ({
        id: activity.id,
        userId: activity.userId,
        projectId: activity.projectId,
        taskId: activity.taskId,
        documentId: activity.documentId,
        surveyId: activity.surveyId,
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        metadata: dto.includeMetadata ? activity.metadata : undefined,
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        createdAt: activity.createdAt,
        user: dto.includeUserDetails ? activity.user : undefined,
        project: activity.project,
        task: activity.task,
        document: activity.document,
        survey: activity.survey,
      })),
    };

    return JSON.stringify(exportData, null, 2);
  }

  private async generatePDF(
    activities: any[],
    dto: ExportActivityLogsDto
  ): Promise<Buffer> {
    // This would typically use a PDF generation library like puppeteer or pdfkit
    // For now, we'll return a placeholder
    const content = this.generateCSV(activities, dto);
    return Buffer.from(content, "utf8");
  }

  private async saveFile(
    data: string | Buffer,
    filename: string,
    extension: string
  ): Promise<string> {
    // This would typically save to a file storage service (S3, local filesystem, etc.)
    // For now, we'll return a placeholder URL
    const timestamp = Date.now();
    return `/api/v1/activity-logs/download/${timestamp}/${filename}`;
  }
}
