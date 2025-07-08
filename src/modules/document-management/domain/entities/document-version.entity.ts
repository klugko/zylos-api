export class DocumentVersionEntity {
    constructor(
      public readonly id: string,
      public readonly documentId: string,
      public readonly url: string,
      public readonly versionAt: Date,
      public readonly name: string,
      public readonly type: string | null,
      public readonly size: number,
      public readonly mimetype: string,
    ) {}
  }
  