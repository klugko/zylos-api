import { IsString, IsOptional, IsEnum, IsBoolean } from "class-validator";
import {
  AlertType,
  AlertSeverity,
} from "../../domain/entities/status-alert.entity";

export class CreateStatusAlertDto {
  @IsString()
  taskId: string;

  @IsString()
  projectId: string;

  @IsString()
  customStatusId: string;

  @IsEnum(AlertType)
  type: AlertType;

  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  suggestedStatusId?: string;
}

export class ResolveStatusAlertDto {
  @IsOptional()
  @IsString()
  resolution?: string;
}
