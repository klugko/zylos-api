import { PartialType } from "@nestjs/mapped-types";
import { CreateSurveyDto } from "./create-survey.dto";
import { IsEnum, IsOptional } from "class-validator";
import { SurveyStatus } from "../../domain/enums/survey.enums";

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;
}
