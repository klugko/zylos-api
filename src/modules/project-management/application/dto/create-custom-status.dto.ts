import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsHexColor,
} from "class-validator";

export class CreateCustomStatusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsHexColor()
  color: string;

  @IsInt()
  order: number;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
