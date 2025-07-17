import { DocumentEntity } from '../entities/document.entity';
import { DocumentTag } from '../enums/document-tags.enum';

export abstract class DocumentRepository {
  abstract findById(id: string): Promise<DocumentEntity | null>;
  abstract findByUrl(url: string): Promise<DocumentEntity | null>;
  abstract save(data: Omit<DocumentEntity, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<DocumentEntity>;
  abstract findAllByProject(projectId: string): Promise<DocumentEntity[]>;
  abstract findByTags(tags: DocumentTag[], projectId?: string): Promise<DocumentEntity[]>;
}
