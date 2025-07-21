import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IProjectChatMessageRepository } from '../../domain/interfaces/project-chat-message.repository.interface';
import { ProjectChatMessage } from '../../domain/entities/project-chat-message.entity';

@Injectable()
export class PrismaProjectChatMessageRepository implements IProjectChatMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(message: ProjectChatMessage): Promise<ProjectChatMessage> {
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

  async findByProject(projectId: string, limit: number, cursor?: string): Promise<ProjectChatMessage[]> {
    const results = await this.prisma.projectChatMessage.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
    });

    return results.map(
      (r) => new ProjectChatMessage(r.id, r.projectId, r.senderId, r.content, r.createdAt),
    );
  }
}
