import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { ConversationResponseDto } from '../dto/chat-response.dto';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';

@Injectable()
export class GetConversationUseCase {
  private readonly logger = new Logger(GetConversationUseCase.name);

  constructor(
    @Inject('AiConversationRepository') private readonly conversationRepo: AiConversationRepository,
  ) {}

  async execute(userId: string, conversationId: string): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepo.findById(conversationId);
      
      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Vérifier que la conversation appartient à l'utilisateur
      if (conversation.userId !== userId) {
        throw new NotFoundException('Conversation non trouvée');
      }

      return {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      };
    } catch (error) {
      this.logger.error(`Get conversation failed: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Impossible de récupérer la conversation: ${error.message}`);
    }
  }
}
