import { Injectable } from '@nestjs/common';
import { FileStorageService } from '../../infrastructure/services/file-storage.service';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';
import { UploadDocumentDto } from '../../dto/upload-document.dto';
import { DocumentVersionRepository } from '../../domain/interfaces/document-version.repository.interface';

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    private readonly repo: DocumentRepository,
    private readonly storage: FileStorageService,
    private readonly versionRepo: DocumentVersionRepository,
  ) {}

  async execute(file: Express.Multer.File, dto: UploadDocumentDto) {
    const url = await this.storage.save(file);

    // Recherche d’un document existant
    const existingDocs = await this.repo.findAllByProject(dto.projectId);
    const match = existingDocs.find(doc => doc.name === file.originalname);

    // Si déjà existant : on versionne
    if (match) {
      await this.versionRepo.create({
        documentId: match.id,
        url: match.url,
        name: match.name,
        type: match.type,
        mimetype: file.mimetype,
        size: file.size,
      });
    }

    // Écrase ou crée le document principal
    return this.repo.save({
      name: file.originalname,
      type: dto.type,
      url,
      uploadedById: null, // pas d'authentification
      projectId: dto.projectId,
    });
  }
}
