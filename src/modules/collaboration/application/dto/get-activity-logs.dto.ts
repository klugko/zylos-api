import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';

export class GetActivityLogsDto {
  @ApiPropertyOptional({ description: 'Filtrer par ID utilisateur externe' })
  @IsOptional() @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filtrer par ID projet' })
  @IsOptional() @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: 'Date de début (ISO)' })
  @IsOptional() @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO)' })
  @IsOptional() @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page', default: 1 })
  @IsOptional() @IsInt() @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Taille par page', default: 20 })
  @IsOptional() @IsInt() @Min(1)
  limit?: number = 20;
}
