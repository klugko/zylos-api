import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { ChatRepository } from '../../domain/interfaces/chat-repository.interface';
import { ProjectChatMessage } from '@modules/collab-chat/domain/entities/project-chat-message.entity';

@Injectable()
export class PrismaChatRepository implements ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMessagesByProjectId(projectId: string) {
    const messages = await this.prisma.projectChatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true },
    });

    return messages.map(m => ({
      content: m.content,
      senderName: m.sender?.fullname ?? 'Inconnu',
      createdAt: m.createdAt,
    }));
  }

  async createMessage(data: { projectId: string; senderId: string; content: string }) {
    return this.prisma.projectChatMessage.create({
      data: {
        projectId: data.projectId,
        senderId: data.senderId,
        content: data.content,
      },
      include: {
        sender: true,
        project: true,
      },
    });
  }
  
  async findProjectById(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      return null;
    }

    return {
      ...project,
      budget: project.budget.toNumber(),
      archive: function () {
        if (this.isArchived) {
          throw new Error('Project is already archived.');
        }
        this.isArchived = true;
      },
    };
  }

  async createMessageProject(message: ProjectChatMessage): Promise<ProjectChatMessage> {
    const created = await this.prisma.projectChatMessage.create({
      data: {
        id: message.id,
        projectId: message.projectId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
      },
    });

    return new ProjectChatMessage(
      created.id,
      created.projectId,
      created.senderId,
      created.content,
      created.createdAt,
    );
  }
  
}
