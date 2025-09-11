import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsUUID, ValidateIf } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ 
    example: 'Quelles sont mes tâches en retard aujourd\'hui ?',
    description: 'Message de l\'utilisateur à l\'assistant IA',
    minLength: 1,
    maxLength: 2000
  })
  @IsString()
  @MinLength(1, { message: 'Le message ne peut pas être vide' })
  @MaxLength(2000, { message: 'Le message ne peut pas dépasser 2000 caractères' })
  message: string;

  @ApiProperty({ 
    example: 'uuid-conversation-id',
    description: 'ID de la conversation (optionnel, crée une nouvelle conversation si non fourni)',
    required: false
  })
  @IsOptional()
  @ValidateIf((o) => o.conversationId !== undefined && o.conversationId !== null && o.conversationId !== '')
  @IsUUID(4, { message: 'L\'ID de conversation doit être un UUID valide' })
  conversationId?: string;
}

export class CreateConversationDto {
  @ApiProperty({ 
    example: 'Planification de la semaine',
    description: 'Titre de la nouvelle conversation',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1, { message: 'Le titre ne peut pas être vide' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;
}

export class UpdateConversationDto {
  @ApiProperty({ 
    example: 'Planification de la semaine - Mise à jour',
    description: 'Nouveau titre de la conversation',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @MinLength(1, { message: 'Le titre ne peut pas être vide' })
  @MaxLength(100, { message: 'Le titre ne peut pas dépasser 100 caractères' })
  title: string;
}
