import { Injectable } from '@nestjs/common';
import { DocumentVersionRepository } from '../../domain/interfaces/document-version.repository.interface';
import { DocumentVersionEntity } from '../../domain/entities/document-version.entity';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class PrismaDocumentVersionRepository extends DocumentVersionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: Omit<DocumentVersionEntity, 'id' | 'versionAt'>): Promise<void> {
    await this.prisma.documentVersion.create({
      data: {
        documentId: data.documentId,
        url: data.url,
        name: data.name,
        type: data.type,
        mimetype: data.mimetype,
        size: data.size,
      },
    });
  }

  async findAllByDocument(documentId: string): Promise<DocumentVersionEntity[]> {
    const versions = await this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionAt: 'desc' },
    });

    return versions.map(v => new DocumentVersionEntity(
      v.id, v.documentId, v.url, v.versionAt,
      v.name, v.type, v.size, v.mimetype,
    ));
  }

  async findById(id: string): Promise<DocumentVersionEntity | null> {
    const v = await this.prisma.documentVersion.findUnique({ where: { id } });
    return v ? new DocumentVersionEntity(v.id, v.documentId, v.url, v.versionAt, v.name, v.type, v.size, v.mimetype) : null;
  }
}
