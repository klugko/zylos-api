import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../../domain/entities/task.entity';


export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsString()
  projectId: string;
}
