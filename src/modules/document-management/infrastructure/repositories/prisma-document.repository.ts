import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class PrismaDocumentRepository extends DocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(data: Omit<DocumentEntity, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<DocumentEntity> {
    const doc = await this.prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        uploadedById: null, // auth inactive
        projectId: data.projectId,
      },
    });

    return new DocumentEntity(
      doc.id,
      doc.name,
      doc.type,
      doc.url,
      doc.uploadedById,
      doc.projectId,
      doc.uploadedAt,
      doc.updatedAt,
    );
  }

  async findAllByProject(projectId: string): Promise<DocumentEntity[]> {
    const docs = await this.prisma.document.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
    });

    return docs.map(
      (doc) =>
        new DocumentEntity(
          doc.id,
          doc.name,
          doc.type,
          doc.url,
          doc.uploadedById,
          doc.projectId,
          doc.uploadedAt,
          doc.updatedAt,
        ),
    );
  }
}
