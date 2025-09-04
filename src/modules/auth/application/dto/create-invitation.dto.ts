import { UserRole } from '@modules/auth/domain/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'partenaire@example.com', description: 'Email de la personne invitée' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'uuid-project', description: 'ID du projet auquel inviter', required: false })
  @IsString()
  @IsOptional()
  projectId?: string | null;

  @ApiProperty({ example: UserRole.PARTNER, description: 'Rôle de l’utilisateur invité' })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({ example: 'John Doe', description: 'Nom de la personne qui invite' })
  @IsString()
  @IsNotEmpty()
  invitedBy: string;

  @ApiProperty({ example: 'Projet Zylos', description: 'Nom du projet' })
  @IsString()
  @IsNotEmpty()
  projectName: string;
}
