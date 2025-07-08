import { DocumentEntity } from '../entities/document.entity';

export abstract class DocumentRepository {
  abstract save(data: Omit<DocumentEntity, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<DocumentEntity>;
  abstract findAllByProject(projectId: string): Promise<DocumentEntity[]>;
}
