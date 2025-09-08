import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsArray, IsNumber, Min, Max, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ 
    example: 'Jean Dupont', 
    required: false, 
    description: 'Nom complet de l\'utilisateur' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullname?: string;

  @ApiProperty({ 
    example: 'jean@example.com', 
    required: false, 
    description: 'Adresse email de l\'utilisateur' 
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ 
    example: '+261341234567', 
    required: false, 
    description: 'Numéro de téléphone' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ 
    example: 'Développeur Full Stack', 
    required: false, 
    description: 'Poste occupé' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  poste?: string;

  @ApiProperty({
    example: ['nestjs', 'docker', 'typescript'],
    required: false,
    description: 'Liste des compétences',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({
    example: 40,
    required: false,
    description: 'Disponibilité horaire hebdomadaire (en heures)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  availability?: number;

  @ApiProperty({
    example: 85,
    required: false,
    description: 'Score de performance (%)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  performanceScore?: number;
}