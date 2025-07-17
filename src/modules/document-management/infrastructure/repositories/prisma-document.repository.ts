import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';
import { DocumentEntity } from '../../domain/entities/document.entity';
import { PrismaService } from '@core/prisma/prisma.service';
import { DocumentTag } from '../../domain/enums/document-tags.enum';

@Injectable()
export class PrismaDocumentRepository extends DocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(
    data: Omit<
      DocumentEntity, 
      'id' | 'uploadedAt' | 'updatedAt'
    >
  ): Promise<DocumentEntity> {
    const doc = await this.prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        uploadedById: data.uploadedById,
        projectId: data.projectId,
        tags: data.tags, 
        metadata: data.metadata,
        validationRequired: data.validationRequired,
      },
    });

    return this.mapToEntity(doc);
  }

  async findAllByProject(projectId: string): Promise<DocumentEntity[]> {
    const docs = await this.prisma.document.findMany({
      where: { projectId },
      orderBy: { uploadedAt: 'desc' },
    });

    return docs.map(this.mapToEntity);
  }

  async findByTags(tags: DocumentTag[], projectId?: string): Promise<DocumentEntity[]> {
    const whereClause: any = {
      tags: {
        hasSome: tags
      }
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    const docs = await this.prisma.document.findMany({
      where: whereClause,
      orderBy: { uploadedAt: 'desc' },
    });

    return docs.map(this.mapToEntity);
  }

  async findById(id: string): Promise<DocumentEntity | null> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!doc) return null;

    return this.mapToEntity(doc);
  }

  async findByUrl(url: string): Promise<DocumentEntity | null> {
    const doc = await this.prisma.document.findFirst({
      where: { url },
    });
  
    if (!doc) return null;
  
    return this.mapToEntity(doc);
  }

  private mapToEntity(doc: any): DocumentEntity {
    return new DocumentEntity(
      doc.id,
      doc.name,
      doc.type,
      doc.url,
      doc.uploadedById,
      doc.projectId,
      doc.uploadedAt,
      doc.updatedAt,
      doc.tags as DocumentTag[], 
      doc.metadata,
      doc.validationRequired
    );
  }
}