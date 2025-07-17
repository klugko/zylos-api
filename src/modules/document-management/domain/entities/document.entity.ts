import { DocumentTag } from "../enums/document-tags.enum";

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
    public readonly tags: DocumentTag[],
    public readonly metadata: Record<string, any> | null,
    public readonly validationRequired: boolean,
  ) {}
}