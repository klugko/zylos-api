import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { SurveyType, VoteType } from "../../domain/enums/survey.enums";

export class CreateSurveyOptionDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateSurveyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SurveyType)
  type: SurveyType;

  @IsEnum(VoteType)
  voteType: VoteType;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsBoolean()
  allowMultipleVotes?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxVotesPerUser?: number;

  @IsOptional()
  @IsBoolean()
  weightEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyOptionDto)
  options: CreateSurveyOptionDto[];
}
