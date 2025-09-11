import { ApiProperty } from '@nestjs/swagger';
import { MessageRole } from '../../domain/entities/ai-conversation.entity';

export class MessageResponseDto {
  @ApiProperty({ description: 'ID du message' })
  id: string;

  @ApiProperty({ enum: MessageRole, description: 'Rôle de l\'expéditeur' })
  role: MessageRole;

  @ApiProperty({ description: 'Contenu du message' })
  content: string;

  @ApiProperty({ description: 'Date de création du message' })
  createdAt: Date;
}

export class ConversationResponseDto {
  @ApiProperty({ description: 'ID de la conversation' })
  id: string;

  @ApiProperty({ description: 'Titre de la conversation' })
  title: string;

  @ApiProperty({ description: 'Date de création de la conversation' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  updatedAt: Date;

  @ApiProperty({ 
    type: [MessageResponseDto],
    description: 'Messages de la conversation'
  })
  messages: MessageResponseDto[];
}

export class SendMessageResponseDto {
  @ApiProperty({ description: 'ID de la conversation' })
  conversationId: string;

  @ApiProperty({ 
    type: MessageResponseDto,
    description: 'Message de l\'utilisateur'
  })
  userMessage: MessageResponseDto;

  @ApiProperty({ 
    type: MessageResponseDto,
    description: 'Réponse de l\'assistant IA'
  })
  assistantMessage: MessageResponseDto;
}

export class ConversationListResponseDto {
  @ApiProperty({ 
    type: [ConversationResponseDto],
    description: 'Liste des conversations de l\'utilisateur'
  })
  conversations: ConversationResponseDto[];

  @ApiProperty({ description: 'Nombre total de conversations' })
  total: number;
}
