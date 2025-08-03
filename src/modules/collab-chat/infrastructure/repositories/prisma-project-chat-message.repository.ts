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

  async findByProject(
    projectId: string, 
    limit: number, 
    page: number = 1
  ): Promise<{
    messages: ProjectChatMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [total, results] = await Promise.all([
      this.prisma.projectChatMessage.count({ where: { projectId } }),
      this.prisma.projectChatMessage.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      })
    ]);
  
    return {
      messages: results.map(r => new ProjectChatMessage(r.id, r.projectId, r.senderId, r.content, r.createdAt)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

}
