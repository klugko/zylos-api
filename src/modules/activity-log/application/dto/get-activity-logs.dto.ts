import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsArray,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  ActivityType,
  ActivityAction,
  ActivityFilterType,
} from "../../domain/enums/activity.enums";

export class GetActivityLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  surveyId?: string;

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

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";

  @IsOptional()
  @IsString()
  groupBy?: "day" | "type" | "user" | "none" = "none";
}
