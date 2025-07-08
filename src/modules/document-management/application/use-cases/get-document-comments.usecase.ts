import { Injectable } from '@nestjs/common';
import { DocumentCommentRepository } from '../../domain/interfaces/document-comment.repository.interface';

@Injectable()
export class GetDocumentCommentsUseCase {
  constructor(private readonly repo: DocumentCommentRepository) {}

  async execute(documentId: string) {
    return this.repo.findAllByDocument(documentId);
  }
}
