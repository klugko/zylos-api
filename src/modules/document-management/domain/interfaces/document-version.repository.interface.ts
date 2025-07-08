import { DocumentVersionEntity } from '../entities/document-version.entity';

export abstract class DocumentVersionRepository {
  abstract create(version: Omit<DocumentVersionEntity, 'id' | 'versionAt'>): Promise<void>;
  abstract findAllByDocument(documentId: string): Promise<DocumentVersionEntity[]>;
  abstract findById(id: string): Promise<DocumentVersionEntity | null>;
}
