import { DocumentCommentEntity } from '../entities/document-comment.entity';

export abstract class DocumentCommentRepository {
  abstract create(data: Omit<DocumentCommentEntity, 'id' | 'createdAt' | 'updatedAt' | 'resolved'>): Promise<DocumentCommentEntity>;
  abstract findAllByDocument(documentId: string): Promise<DocumentCommentEntity[]>;
  abstract resolve(commentId: string): Promise<void>;
}
