export class DocumentSignatureEntity {
    constructor(
      public readonly id: string,
      public readonly documentId: string,
      public readonly status: 'en_attente' | 'signé' | 'refusé' | 'expiré',
      public readonly signatureUrl: string | null,
      public readonly requestedAt: Date,
      public readonly signedAt: Date | null,
    ) {}
  }
  