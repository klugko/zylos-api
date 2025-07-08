import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';

@Injectable()
export class GetProjectDocumentsUseCase {
  constructor(private readonly repo: DocumentRepository) {}

  async execute(projectId: string) {
    return this.repo.findAllByProject(projectId);
  }
}
