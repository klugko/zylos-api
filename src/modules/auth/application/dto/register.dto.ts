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


}
