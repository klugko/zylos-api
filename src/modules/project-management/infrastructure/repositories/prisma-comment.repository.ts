import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentRepository } from '@modules/project-management/domain/interfaces/comment.repository.interface';
import { CommentTargetType } from '@modules/project-management/domain/enums/comment.enums';

@Injectable()
export class PrismaCommentRepository implements CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    });

    return new Comment(
      data.id,
      data.content,
      data.authorId ?? null,
      data.createdAt,
      data.targetType as CommentTargetType,
      data.targetId
    );
  }

  async findByTarget(
    type: CommentTargetType,
    id: string
  ): Promise<Comment[]> {
    const list = await this.prisma.comment.findMany({
      where: {
        targetType: type,
        targetId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(data =>
      new Comment(
        data.id,
        data.content,
        data.authorId ?? null,
        data.createdAt,
        data.targetType as CommentTargetType,
        data.targetId
      )
    );
  }
}
