import { Inject, Injectable } from '@nestjs/common';
import { IProjectChatMessageRepository } from '../../domain/interfaces/project-chat-message.repository.interface';
import { ProjectChatMessage } from '../../domain/entities/project-chat-message.entity';
import { CreateChatMessageDto } from '../dto/create-chat-message.dto';
import { ChatAiAnalysisService } from '../services/chat-ai-analysis.service';
import { AccessControlService } from 'src/modules/collaboration/application/services/access-control.service';

@Injectable()
export class CreateChatMessageUseCase {
  constructor(
    @Inject('IProjectChatMessageRepository')
    private readonly repository: IProjectChatMessageRepository,

    private readonly accessControl: AccessControlService,
    private readonly aiAnalysis: ChatAiAnalysisService,
  ) {}

  async execute(dto: CreateChatMessageDto, userId: string): Promise<ProjectChatMessage> {
    await this.accessControl.ensureProjectAccess(userId, dto.projectId, 'comment');

    const message = ProjectChatMessage.create({
      id: crypto.randomUUID(),
      projectId: dto.projectId,
      senderId: userId,
      content: dto.content,
    });

    const saved = await this.repository.create(message);

    this.aiAnalysis.analyzeAndSuggestTasks(saved).catch((err) => {
      console.error('[ChatAI] analysis error', err);
    });

    return saved;
  }
}
