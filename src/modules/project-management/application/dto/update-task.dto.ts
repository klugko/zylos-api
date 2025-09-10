import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsDateString } from "class-validator";
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
  @IsDateString()
  @IsOptional()
  startDate?: Date | null;

  @ApiProperty({ required: false, type: String, format: "date-time" })
  @IsDateString()
  @IsOptional()
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
