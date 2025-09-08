import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsHexColor,
} from "class-validator";

export class UpdateCustomStatusDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
