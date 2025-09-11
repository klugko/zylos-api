import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { UpdateConversationDto } from '../dto/chat.dto';
import { ConversationResponseDto } from '../dto/chat-response.dto';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';

@Injectable()
export class UpdateConversationUseCase {
  private readonly logger = new Logger(UpdateConversationUseCase.name);

  constructor(
    @Inject('AiConversationRepository') private readonly conversationRepo: AiConversationRepository,
  ) {}

  async execute(userId: string, conversationId: string, dto: UpdateConversationDto): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepo.findById(conversationId);
      
      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Vérifier que la conversation appartient à l'utilisateur
      if (conversation.userId !== userId) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Mettre à jour le titre
      conversation.updateTitle(dto.title);

      // Sauvegarder les modifications
      const updatedConversation = await this.conversationRepo.update(conversation);

      return {
        id: updatedConversation.id,
        title: updatedConversation.title,
        createdAt: updatedConversation.createdAt,
        updatedAt: updatedConversation.updatedAt,
        messages: updatedConversation.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      };
    } catch (error) {
      this.logger.error(`Update conversation failed: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Impossible de mettre à jour la conversation: ${error.message}`);
    }
  }
}
