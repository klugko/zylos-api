import { Inject, Injectable } from '@nestjs/common';
import { ChatRepository } from '../../domain/interfaces/chat-repository.interface';
import { OpenAIService } from 'src/shared/ai/openai.service';

@Injectable()
export class SummarizeProjectChatUseCase {
  constructor(
    @Inject('ChatRepository') private readonly chatRepository: ChatRepository,
    private readonly openAIService: OpenAIService,
  ) {}

  async execute(projectId: string): Promise<string> {
    const messages = await this.chatRepository.getMessagesByProjectId(projectId);

    if (messages.length === 0) return 'Aucun message trouvé pour ce projet.';

    const transcript = messages.map(
      m => `[${m.createdAt.toISOString()}] ${m.senderName}: ${m.content}`
    ).join('\n');

    const prompt = `Voici une conversation de chat de projet. Résume les idées principales, décisions et points bloquants :\n\n${transcript}`;

    const summary = await this.openAIService.summarizeText(prompt);
    return summary;
  }
}
