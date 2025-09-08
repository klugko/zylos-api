import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  ActivityType,
  ActivityAction,
  ActivityFilterType,
  ActivityExportFormat,
} from "../../domain/enums/activity.enums";

export class ExportActivityLogsDto {
  @ApiProperty({
    description: "ID du projet pour filtrer les activités",
    example: "proj_123456789",
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    description: "ID de l'utilisateur pour filtrer les activités",
    example: "user_987654321",
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: "Type d'activité à exporter",
    enum: ActivityType,
    example: ActivityType.PROJECT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @ApiProperty({
    description: "Actions spécifiques à exporter",
    enum: ActivityAction,
    isArray: true,
    example: [ActivityAction.PROJECT_CREATED, ActivityAction.PROJECT_UPDATED],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ActivityAction, { each: true })
  actions?: ActivityAction[];

  @ApiProperty({
    description: "Type de filtre à appliquer",
    enum: ActivityFilterType,
    example: ActivityFilterType.ALL,
    required: false,
    default: ActivityFilterType.ALL,
  })
  @IsOptional()
  @IsEnum(ActivityFilterType)
  filterType?: ActivityFilterType = ActivityFilterType.ALL;

  @ApiProperty({
    description: "Terme de recherche dans les titres et descriptions",
    example: "projet",
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: "Date de début pour filtrer les activités (ISO 8601)",
    example: "2024-01-01T00:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Date de fin pour filtrer les activités (ISO 8601)",
    example: "2024-12-31T23:59:59.999Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Format d'export des données",
    enum: ActivityExportFormat,
    example: ActivityExportFormat.CSV,
  })
  @IsEnum(ActivityExportFormat)
  format: ActivityExportFormat;

  @ApiProperty({
    description: "Nom du fichier d'export (sans extension)",
    example: "rapport_activites_janvier_2024",
    required: false,
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiProperty({
    description: "Critère de regroupement des données",
    enum: ["day", "type", "user", "none"],
    example: "day",
    required: false,
    default: "none",
  })
  @IsOptional()
  @IsString()
  groupBy?: "day" | "type" | "user" | "none" = "none";

  @ApiProperty({
    description: "Inclure les métadonnées dans l'export",
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean = false;

  @ApiProperty({
    description: "Inclure les détails des utilisateurs dans l'export",
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeUserDetails?: boolean = true;
}
