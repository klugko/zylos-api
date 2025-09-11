import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConversationListResponseDto, ConversationResponseDto } from '../dto/chat-response.dto';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';

@Injectable()
export class GetConversationsUseCase {
  private readonly logger = new Logger(GetConversationsUseCase.name);

  constructor(
    @Inject('AiConversationRepository') private readonly conversationRepo: AiConversationRepository,
  ) {}

  async execute(userId: string, limit: number = 20, offset: number = 0): Promise<ConversationListResponseDto> {
    try {
      const conversations = await this.conversationRepo.findByUserId(userId, limit, offset);
      const total = await this.conversationRepo.countByUserId(userId);

      const conversationDtos: ConversationResponseDto[] = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messages: conv.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      }));

      return {
        conversations: conversationDtos,
        total
      };
    } catch (error) {
      this.logger.error(`Get conversations failed: ${error.message}`);
      throw new Error(`Impossible de récupérer les conversations: ${error.message}`);
    }
  }
}
