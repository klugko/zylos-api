import { Inject, Injectable } from '@nestjs/common';
import { ProjectChatMessage } from '../../domain/entities/project-chat-message.entity';
import { v4 as uuid } from 'uuid';
import { ChatRepository } from '@modules/collab-chat/domain/interfaces/chat-repository.interface';

@Injectable()
export class CreateChatMessageProjectUseCase {
  constructor(
    @Inject('ChatRepository')
    private readonly repository: ChatRepository,
  ) {}

  async execute(userId: string, projectId: string, content: string): Promise<ProjectChatMessage> {
    const message = ProjectChatMessage.create({
      id: uuid(),
      projectId,
      senderId: userId,
      content,
    });
  
    return this.repository.createMessageProject(message); 
  }
  
}
