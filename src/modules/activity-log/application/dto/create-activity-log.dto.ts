import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
} from "class-validator";
import {
  ActivityType,
  ActivityAction,
} from "../../domain/enums/activity.enums";

export class CreateActivityLogDto {
  @IsString()
  userId: string;

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

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsEnum(ActivityAction)
  action: ActivityAction;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
