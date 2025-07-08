import { PrismaService } from '@core/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetDocumentClassificationUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(documentId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        name: true,
        tags: true,
        metadata: true,
        validationRequired: true,
        uploadedAt: true,
      },
    });

    if (!doc) throw new NotFoundException('Document introuvable');

    return doc;
  }
}
