export class DocumentCommentEntity {
    constructor(
      public readonly id: string,
      public readonly documentId: string,
      public readonly content: string,
      public readonly zone: string | null,
      public readonly resolved: boolean,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
    ) {}
  }
  