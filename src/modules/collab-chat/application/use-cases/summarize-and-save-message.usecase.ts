import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from '../../domain/interfaces/chat-repository.interface';
import { OpenAIService } from 'src/shared/ai/openai.service';
import { ProjectChatMessage } from '@modules/collab-chat/domain/entities/project-chat-message.entity';

@Injectable()
export class SummarizeAndSaveMessageUseCase {
  constructor(
    @Inject('ChatRepository') private readonly chatRepository: ChatRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(
    userId: string,
    projectId: string,
    messageContent: string,
  ): Promise<ProjectChatMessage> {
    const summary = await this.openAIService.summarizeText(
      `Voici un texte issu d’un échange en visio ou chat long. Résume les décisions, points bloquants et actions :\n\n${messageContent}`
    );
    
    const project = await this.chatRepository.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Projet introuvable`);
    }

    return this.chatRepository.createMessage({
      projectId,
      senderId: userId,
      content: summary,
    });
  }
}
