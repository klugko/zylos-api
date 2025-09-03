import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersDto {
  @ApiProperty({ example: 1, required: false, description: 'Numéro de page (défaut: 1)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ example: 10, required: false, description: 'Taille de page (défaut: 10)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number) 
  limit: number = 10;

  @ApiProperty({ example: 'jean', required: false, description: 'Terme de recherche global' })
  @IsOptional()
  search?: string;
}
