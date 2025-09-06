import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";
import { SurveyStatus, SurveyType } from "../../domain/enums/survey.enums";

export class GetSurveysDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @IsOptional()
  @IsEnum(SurveyType)
  type?: SurveyType;

  @IsOptional()
  @IsString()
  search?: string;

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
}
