import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateProjectDto {
  @ApiProperty({ example: 'Refonte site web', description: 'Nom du projet' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Projet de refonte du site', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'DEVELOPPEMENT_LOGICIEL', description: 'Type du projet' })
  @IsString()
  @MaxLength(50)
  type: string;
}