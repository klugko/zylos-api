import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentRepository } from '@modules/project-management/domain/interfaces/comment.repository.interface';
import { CommentTargetType } from '@modules/project-management/domain/enums/comment.enums';
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly authorSelect = {
    id: true,
    fullname: true,
    email: true,
    role: true,
    isActive: true,
    skills: true,
    availability: true,
    performanceScore: true,
    createdAt: true,
    updatedAt: true,
  };

  private toEntity(data: any): Comment {
    const comment = new Comment(
      data.id,
      data.content,
      data.authorId ?? null,
      data.createdAt,
      data.targetType as CommentTargetType,
      data.targetId
    );

    if (data.author) {
      comment.author = {
        ...data.author,
        role: data.author.role as UserRole,
      };
    }

    return comment;
  }

  async create(comment: Comment): Promise<Comment> {
    const data = await this.prisma.comment.create({
      data: {
        id: comment.id,
        content: comment.content,
        targetType: comment.targetType,
        targetId: comment.targetId,
        authorId: comment.authorId ?? null,
        createdAt: comment.createdAt,
      },
      include: {
        author: {
          select: this.authorSelect
        }
      }
    });

    return this.toEntity(data);
  }

  async findByTarget(
    type: CommentTargetType,
    id: string
  ): Promise<Comment[]> {
    const data = await this.prisma.comment.findMany({
      where: {
        targetType: type,
        targetId: id,
      },
      include: {
        author: {
          select: this.authorSelect
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return data.map(this.toEntity);
  }

  async findById(id: string): Promise<Comment | null> {
    const data = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: this.authorSelect
        }
      }
    });
    return data ? this.toEntity(data) : null;
  }

  async update(id: string, content: string): Promise<Comment> {
    const data = await this.prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: this.authorSelect
        }
      }
    });
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({ where: { id } });
  }

  async countByTarget(
    type: CommentTargetType,
    id: string
  ): Promise<number> {
    return this.prisma.comment.count({
      where: {
        targetType: type,
        targetId: id,
      }
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.comment.count({
      where: { id }
    });
    return count > 0;
  }
}