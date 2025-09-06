import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from "class-validator";
import {
  ActivityType,
  ActivityAction,
  ActivityFilterType,
  ActivityExportFormat,
} from "../../domain/enums/activity.enums";

export class ExportActivityLogsDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsArray()
  @IsEnum(ActivityAction, { each: true })
  actions?: ActivityAction[];

  @IsOptional()
  @IsEnum(ActivityFilterType)
  filterType?: ActivityFilterType = ActivityFilterType.ALL;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(ActivityExportFormat)
  format: ActivityExportFormat;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  groupBy?: "day" | "type" | "user" | "none" = "none";

  @IsOptional()
  @IsString()
  includeMetadata?: boolean = false;

  @IsOptional()
  @IsString()
  includeUserDetails?: boolean = true;
}
