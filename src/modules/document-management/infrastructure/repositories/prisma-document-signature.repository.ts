import { Injectable } from '@nestjs/common';
import { DocumentSignatureRepository } from '../../domain/interfaces/document-signature.repository.interface';
import { DocumentSignatureEntity } from '../../domain/entities/document-signature.entity';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class PrismaDocumentSignatureRepository extends DocumentSignatureRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createRequest(documentId: string): Promise<DocumentSignatureEntity> {
    const signature = await this.prisma.documentSignature.create({
      data: {
        documentId,
        status: 'en_attente',
      },
    });

    return new DocumentSignatureEntity(
      signature.id,
      signature.documentId,
      signature.status as any,
      signature.signatureUrl,
      signature.requestedAt,
      signature.signedAt,
    );
  }

  async submitSignature(documentId: string, imagePath: string): Promise<DocumentSignatureEntity> {
    const updated = await this.prisma.documentSignature.updateMany({
      where: { documentId, status: 'en_attente' },
      data: {
        status: 'signé',
        signatureUrl: imagePath,
        signedAt: new Date(),
      },
    });

    const signature = await this.prisma.documentSignature.findFirst({ where: { documentId } });

    return new DocumentSignatureEntity(
      signature.id,
      signature.documentId,
      signature.status as any,
      signature.signatureUrl,
      signature.requestedAt,
      signature.signedAt,
    );
  }

  async getByDocumentId(documentId: string): Promise<DocumentSignatureEntity | null> {
    const sig = await this.prisma.documentSignature.findFirst({ where: { documentId } });
    return sig
      ? new DocumentSignatureEntity(
          sig.id,
          sig.documentId,
          sig.status as any,
          sig.signatureUrl,
          sig.requestedAt,
          sig.signedAt,
        )
      : null;
  }
}
