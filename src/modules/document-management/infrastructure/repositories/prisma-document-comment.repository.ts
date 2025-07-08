import { Injectable } from '@nestjs/common';
import { DocumentCommentEntity } from '../../domain/entities/document-comment.entity';
import { DocumentCommentRepository } from '../../domain/interfaces/document-comment.repository.interface';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class PrismaDocumentCommentRepository extends DocumentCommentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Omit<DocumentCommentEntity, 'id' | 'createdAt' | 'updatedAt' | 'resolved'>): Promise<DocumentCommentEntity> {
    const comment = await this.prisma.documentComment.create({
      data: {
        documentId: data.documentId,
        content: data.content,
        zone: data.zone,
      },
    });

    return new DocumentCommentEntity(
      comment.id,
      comment.documentId,
      comment.content,
      comment.zone,
      comment.resolved,
      comment.createdAt,
      comment.updatedAt,
    );
  }

  async findAllByDocument(documentId: string): Promise<DocumentCommentEntity[]> {
    const results = await this.prisma.documentComment.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });

    return results.map((c) =>
      new DocumentCommentEntity(
        c.id,
        c.documentId,
        c.content,
        c.zone,
        c.resolved,
        c.createdAt,
        c.updatedAt,
      ),
    );
  }

  async resolve(commentId: string): Promise<void> {
    await this.prisma.documentComment.update({
      where: { id: commentId },
      data: { resolved: true },
    });
  }
}
