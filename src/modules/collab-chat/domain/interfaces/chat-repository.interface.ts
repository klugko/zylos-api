import { Project } from "@modules/project-management/domain/entities/project.entity";
import { ProjectChatMessage } from "../entities/project-chat-message.entity";

export interface ChatRepository {
    getMessagesByProjectId(projectId: string): Promise<{ content: string; senderName: string; createdAt: Date }[]>;
    createMessage(data: { projectId: string; senderId: string; content: string }): Promise<any>;
    findProjectById(projectId: string): Promise<Project | null>;
    createMessageProject(message: ProjectChatMessage): Promise<ProjectChatMessage>;
  }
  