import { AiConversation } from '../entities/ai-conversation.entity';

export interface AiConversationRepository {
  create(conversation: AiConversation): Promise<AiConversation>;
  findById(id: string): Promise<AiConversation | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<AiConversation[]>;
  update(conversation: AiConversation): Promise<AiConversation>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
