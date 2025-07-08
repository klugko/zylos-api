import { Injectable } from '@nestjs/common';
import { DocumentSignatureRepository } from '../../domain/interfaces/document-signature.repository.interface';

@Injectable()
export class InitiateSignatureUseCase {
  constructor(private readonly repo: DocumentSignatureRepository) {}

  async execute(documentId: string) {
    return this.repo.createRequest(documentId);
  }
}
