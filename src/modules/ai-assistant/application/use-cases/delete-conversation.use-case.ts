import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';

@Injectable()
export class DeleteConversationUseCase {
  private readonly logger = new Logger(DeleteConversationUseCase.name);

  constructor(
    @Inject('AiConversationRepository') private readonly conversationRepo: AiConversationRepository,
  ) {}

  async execute(userId: string, conversationId: string): Promise<{ message: string }> {
    try {
      const conversation = await this.conversationRepo.findById(conversationId);
      
      if (!conversation) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Vérifier que la conversation appartient à l'utilisateur
      if (conversation.userId !== userId) {
        throw new NotFoundException('Conversation non trouvée');
      }

      // Supprimer la conversation
      await this.conversationRepo.delete(conversationId);

      return { message: 'Conversation supprimée avec succès' };
    } catch (error) {
      this.logger.error(`Delete conversation failed: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Impossible de supprimer la conversation: ${error.message}`);
    }
  }
}
