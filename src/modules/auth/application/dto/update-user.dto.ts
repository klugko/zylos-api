import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Nom complet de l\'utilisateur' })
  @IsOptional()
  @IsString()
  fullname?: string;

  @ApiPropertyOptional({ description: 'Adresse email de l\'utilisateur' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Rôle de l\'utilisateur', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Compétences de l\'utilisateur' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'Disponibilité de l\'utilisateur (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  availability?: number;

  @ApiPropertyOptional({ description: 'Score de performance de l\'utilisateur (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  performanceScore?: number;
}