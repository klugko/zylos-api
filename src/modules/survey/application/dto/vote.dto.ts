import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from "class-validator";

export class CreateVoteDto {
  @IsString()
  optionId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  weight?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class CreateMultipleVotesDto {
  @IsArray()
  @IsString({ each: true })
  optionIds: string[];

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
