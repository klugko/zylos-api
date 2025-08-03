import { ProjectChatMessage } from '../entities/project-chat-message.entity';

export interface IProjectChatMessageRepository {
  create(message: ProjectChatMessage): Promise<ProjectChatMessage>;
  
  findByProject(
    projectId: string, 
    limit: number, 
    page?: number
  ): Promise<{
    messages: ProjectChatMessage[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}