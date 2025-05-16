import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateProjectFromTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({required: false})
  @IsString()
  @IsNotEmpty()
  ownerId?: string;
}
