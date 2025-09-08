import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsArray, IsOptional, IsInt, Min, Max } from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';


export class RegisterDto {
  @ApiProperty({ example: 'Jean Dupont', description: 'Nom complet de l’utilisateur' })
  @IsString()
  fullname: string;

  @ApiProperty({ example: 'jean@example.com', description: 'Adresse email unique' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe (min. 6 caractères)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER, description: 'Rôle utilisateur' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: ['nestjs', 'docker'],
    required: false,
    description: 'Liste des compétences',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiProperty({
    example: 40,
    required: false,
    description: 'Disponibilité horaire hebdomadaire (en heures)',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  availability?: number;

  @ApiProperty({
    example: 85,
    required: false,
    description: 'Score de performance (%)',
  })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  performanceScore?: number;

@IsOptional()
@IsString()
@ApiProperty({
  example: '123456FKG7890',
  required: false,
  description: 'ID Google si inscription via OAuth2',
})
googleId?: string;

@IsOptional()
@IsString()
@ApiProperty({
  example: '+33123456789',
  required: false,
  description: 'Numéro de téléphone',
})
phone?: string;

@IsOptional()
@IsString()
@ApiProperty({
  example: 'Développeur Full Stack',
  required: false,
  description: 'Poste occupé',
})
poste?: string;

}
