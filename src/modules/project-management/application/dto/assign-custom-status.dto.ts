import { IsString, IsOptional, IsDateString } from "class-validator";

export class AssignCustomStatusDto {
  @IsString()
  taskId: string;

  @IsString()
  customStatusId: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
