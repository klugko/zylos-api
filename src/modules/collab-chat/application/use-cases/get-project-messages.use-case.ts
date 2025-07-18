import { Injectable } from '@nestjs/common';
import { IProjectChatMessageRepository } from '../../domain/interfaces/project-chat-message.repository.interface';
import { ProjectChatMessage } from '../../domain/entities/project-chat-message.entity';
import { AccessControlService } from 'src/modules/collaboration/application/services/access-control.service';

@Injectable()
export class GetProjectMessagesUseCase {
  constructor(
    private readonly repository: IProjectChatMessageRepository,
    private readonly accessControl: AccessControlService,
  ) {}

  async execute(projectId: string, userId: string, limit = 20, cursor?: string): Promise<ProjectChatMessage[]> {
    // Vérifie l’accès lecture
    await this.accessControl.ensureProjectAccess(userId, projectId, 'read');

    return this.repository.findByProject(projectId, limit, cursor);
  }
}
