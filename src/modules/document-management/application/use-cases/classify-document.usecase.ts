import { Injectable } from '@nestjs/common';
import { OpenAiClassifierService } from '../../infrastructure/services/openai-classifier.service';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class ClassifyDocumentUseCase {
  constructor(
    private readonly ai: OpenAiClassifierService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(documentId: string): Promise<void> {
    const doc = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) return;

    const result = await this.ai.classify(doc.url);

    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        tags: result.tags,
        metadata: result.metadata,
        validationRequired: result.validationRequired,
      },
    });
  }
}
