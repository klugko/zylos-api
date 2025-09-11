import { Injectable, Logger, Inject } from '@nestjs/common';
import { SendMessageDto } from '../dto/chat.dto';
import { SendMessageResponseDto } from '../dto/chat-response.dto';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';
import { AiConversation, MessageRole } from '../../domain/entities/ai-conversation.entity';
import { AiAssistantService } from '../services/ai-assistant.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(
    @Inject('AiConversationRepository') private readonly conversationRepo: AiConversationRepository,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  async execute(userId: string, dto: SendMessageDto): Promise<SendMessageResponseDto> {
    try {

      let conversation: AiConversation;
      
      if (dto.conversationId) {
        conversation = await this.conversationRepo.findById(dto.conversationId);
        if (!conversation) {

          this.logger.warn(`Conversation ${dto.conversationId} non trouvée, création d'une nouvelle conversation`);
          const title = this.generateConversationTitle(dto.message);
          conversation = new AiConversation(
            uuidv4(),
            userId,
            title,
            new Date(),
            new Date()
          );
          conversation = await this.conversationRepo.create(conversation);
        } else {

          if (conversation.userId !== userId) {
            throw new Error('Accès non autorisé à cette conversation');
          }
        }
      } else {
        const title = this.generateConversationTitle(dto.message);
        conversation = new AiConversation(
          uuidv4(),
          userId,
          title,
          new Date(),
          new Date()
        );
        conversation = await this.conversationRepo.create(conversation);
      }

      const userMessage = conversation.addMessage(MessageRole.USER, dto.message);

      const userContext = await this.aiAssistantService.getUserContext(userId);

      const assistantResponse = await this.aiAssistantService.generateResponse(dto.message, userContext);

      const assistantMessage = conversation.addMessage(MessageRole.ASSISTANT, assistantResponse);

      const updatedConversation = await this.conversationRepo.update(conversation);

      return {
        conversationId: updatedConversation.id,
        userMessage: {
          id: userMessage.id,
          role: userMessage.role,
          content: userMessage.content,
          createdAt: userMessage.createdAt
        },
        assistantMessage: {
          id: assistantMessage.id,
          role: assistantMessage.role,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt
        }
      };
    } catch (error) {
      this.logger.error(`Send message failed: ${error.message}`);
      throw new Error(`Impossible d'envoyer le message: ${error.message}`);
    }
  }

  private generateConversationTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 5);
    return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
  }
}
