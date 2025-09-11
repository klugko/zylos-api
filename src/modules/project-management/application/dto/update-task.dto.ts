import { ApiProperty, PartialType } from "@nestjs/swagger";
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsDate,
} from "class-validator";
import { Type } from "class-transformer";
import { TaskStatus, TaskPriority } from "../../domain/enums/task.enums";
import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, required: false })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({ required: false, type: String, format: "date-time" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date | null;

  @ApiProperty({ required: false, type: String, format: "date-time" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date | null;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @ApiProperty({ required: false, description: "ID de la colonne de la tâche" })
  @IsString()
  @IsOptional()
  columnId?: string;
}
