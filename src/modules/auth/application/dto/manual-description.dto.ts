import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ManualDescriptionDto {
  @ApiProperty({ 
    example: 'Je suis développeur full-stack avec 5 ans d\'expérience. J\'ai travaillé sur des projets React, Node.js, et PostgreSQL. Je peux travailler 40h par semaine et j\'ai une expertise en développement web moderne.',
    description: 'Description manuelle de votre expérience professionnelle',
    minLength: 50,
    maxLength: 2000
  })
  @IsString()
  @MinLength(50, { message: 'La description doit contenir au moins 50 caractères' })
  @MaxLength(2000, { message: 'La description ne peut pas dépasser 2000 caractères' })
  description: string;
}
