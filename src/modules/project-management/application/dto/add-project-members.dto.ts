import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectRole } from '@modules/project-management/domain/enums/project.enums';

export class AddProjectMemberDto {
  @ApiProperty({
    description: "UUID de l'utilisateur à ajouter au projet",
    example: "a1b2c3d4-e5f6-7890-abcd-ef0123456789"
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Rôle du membre dans le projet',
    enum: ProjectRole,
    example: 'MEMBER'
  })
  @IsEnum(ProjectRole)
  role: ProjectRole;
}

export class AddProjectMembersDto {
  @ApiProperty({
    description: 'UUID du projet auquel ajouter des membres',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Liste des membres à ajouter au projet',
    type: [AddProjectMemberDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddProjectMemberDto)
  members: AddProjectMemberDto[];
}
