import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadCvDto {
  @ApiProperty({ 
    description: 'Type de document (optionnel)',
    example: 'CV',
    required: false 
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class UploadCvBodyDto {
  @ApiProperty({ 
    description: 'Type de document (optionnel)',
    example: 'CV',
    required: false 
  })
  @IsOptional()
  @IsString()
  type?: string;
}