import { IsString, IsOptional, IsDateString, IsDate } from "class-validator";
import { Type } from "class-transformer";

export class AssignCustomStatusDto {
  @IsString()
  taskId: string;

  @IsString()
  customStatusId: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;
}
