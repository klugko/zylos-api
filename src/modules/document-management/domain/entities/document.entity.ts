export class DocumentEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string | null,
    public readonly url: string,
    public readonly uploadedById: string | null,
    public readonly projectId: string,
    public readonly uploadedAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
