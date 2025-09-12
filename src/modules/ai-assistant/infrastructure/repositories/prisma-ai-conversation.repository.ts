import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { AiConversationRepository } from '../../domain/interfaces/ai-conversation-repository.interface';
import { AiConversation, AiMessage, MessageRole } from '../../domain/entities/ai-conversation.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaAiConversationRepository implements AiConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(conversation: AiConversation): Promise<AiConversation> {
    const created = await this.prisma.aiConversation.create({
      data: {
        id: conversation.id,
        userId: conversation.userId,
        title: conversation.title,
        messages: {
          create: conversation.messages.map(msg => ({
            id: uuidv4(),
            role: msg.role,
            content: msg.content,
          }))
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<AiConversation | null> {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return conversation ? this.mapToEntity(conversation) : null;
  }

  async findByUserId(userId: string, limit: number = 20, offset: number = 0): Promise<AiConversation[]> {
    const conversations = await this.prisma.aiConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset
    });

    return conversations.map(conv => this.mapToEntity(conv));
  }

  async update(conversation: AiConversation): Promise<AiConversation> {
    // Mettre à jour la conversation
    const updated = await this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: {
        title: conversation.title,
        updatedAt: conversation.updatedAt
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Ajouter les nouveaux messages (ceux qui ne sont pas encore en base)
    const existingMessageIds = new Set(updated.messages.map(m => m.id));
    const newMessages = conversation.messages.filter(msg => !existingMessageIds.has(msg.id));
    if (newMessages.length > 0) {
      await this.prisma.aiMessage.createMany({
        data: newMessages.map(msg => ({
          id: msg.id,
          conversationId: conversation.id,
          role: msg.role,
          content: msg.content,
        }))
      });

      // Récupérer la conversation avec tous les messages
      const fullConversation = await this.prisma.aiConversation.findUnique({
        where: { id: conversation.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      return fullConversation ? this.mapToEntity(fullConversation) : this.mapToEntity(updated);
    }

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.aiConversation.delete({
      where: { id }
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.aiConversation.count({
      where: { userId }
    });
  }

  private mapToEntity(data: any): AiConversation {
    const messages = data.messages?.map((msg: any) => new AiMessage(
      msg.id,
      msg.conversationId,
      msg.role as MessageRole,
      msg.content,
      msg.createdAt
    )) || [];

    return new AiConversation(
      data.id,
      data.userId,
      data.title,
      data.createdAt,
      data.updatedAt,
      messages
    );
  }
}
