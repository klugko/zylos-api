import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChecklistStatus, ChecklistPriority } from '../../domain/enums/checklist.enums';

export class CreateChecklistDto {
  @ApiProperty({ example: 'Checklist de test', description: 'Titre de la checklist' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'uuid-project-id', description: 'ID du projet' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: 'uuid-task-id', description: 'ID de la tâche associée' })
  @IsString()
  taskId: string;

  @ApiProperty({ enum: ChecklistStatus, default: ChecklistStatus.TODO })
  @IsEnum(ChecklistStatus)
  @IsOptional()
  status?: ChecklistStatus = ChecklistStatus.TODO;

  @ApiProperty({ enum: ChecklistPriority, default: ChecklistPriority.MEDIUM })
  @IsEnum(ChecklistPriority)
  @IsOptional()
  priority?: ChecklistPriority = ChecklistPriority.MEDIUM;

  @ApiProperty({ example: 'uuid-user-id', required: false })
  @IsString()
  @IsOptional()
  assignedUserId?: string;
}
