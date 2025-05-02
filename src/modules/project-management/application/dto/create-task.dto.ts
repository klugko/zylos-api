import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../../domain/enums/task-status.enum';


// export class CreateTaskDto {
//   @IsString()
//   title: string;

//   @IsOptional()
//   @IsString()
//   description?: string;


//   @IsOptional()
//   @IsEnum(TaskStatus)
//   status?: TaskStatus;

//   @IsString()
//   projectId: string;
// }

export class CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  dependencies?: string[];
}
