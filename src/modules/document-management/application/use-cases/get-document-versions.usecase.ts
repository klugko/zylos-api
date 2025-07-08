import { Injectable } from '@nestjs/common';
import { DocumentVersionRepository } from '../../domain/interfaces/document-version.repository.interface';

@Injectable()
export class GetDocumentVersionsUseCase {
  constructor(private readonly repo: DocumentVersionRepository) {}

  async execute(documentId: string) {
    return this.repo.findAllByDocument(documentId);
  }
}
