import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentTargetType } from '@modules/project-management/domain/enums/comment.enums';

export class CreateCommentDto {
  @ApiProperty({ example: 'Très bon début !' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ enum: CommentTargetType })
  @IsEnum(CommentTargetType)
  targetType: CommentTargetType;

  @ApiProperty({ description: 'ID de la cible (projet/tâche/checklist)' })
  @IsUUID()
  targetId: string;

  // @ApiProperty({ required: false, description: 'Auteur (optionnel)' })
  // @IsOptional()
  // @IsUUID()
  // authorId?: string;
}
