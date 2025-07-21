import { ProjectChatMessage } from '../entities/project-chat-message.entity';

export interface IProjectChatMessageRepository {
  create(message: ProjectChatMessage): Promise<ProjectChatMessage>;
  findByProject(projectId: string, limit: number, cursor?: string): Promise<ProjectChatMessage[]>;
}
