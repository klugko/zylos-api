import { Injectable } from '@nestjs/common';
import { ClassificationResultDto } from '../../dto/classification-result.dto';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class ReclassifyDocumentUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(documentId: string, dto: ClassificationResultDto) {
    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        tags: dto.tags,
        metadata: dto.metadata,
        validationRequired: dto.validationRequired,
      },
    });
  }
}
