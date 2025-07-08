import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentVersionRepository } from '../../domain/interfaces/document-version.repository.interface';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';

@Injectable()
export class RestoreDocumentVersionUseCase {
  constructor(
    private readonly versionRepo: DocumentVersionRepository,
    private readonly docRepo: DocumentRepository,
  ) {}

  async execute(documentId: string, versionId: string) {
    const version = await this.versionRepo.findById(versionId);
    if (!version || version.documentId !== documentId) {
      throw new NotFoundException('Version introuvable pour ce document.');
    }

    // Met à jour le document avec les données de la version choisie
    return this.docRepo.save({
      name: version.name,
      type: version.type,
      url: version.url,
      uploadedById: null,
      projectId: version.documentId, 
    });
  }
}
