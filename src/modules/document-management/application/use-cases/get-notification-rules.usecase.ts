import { Injectable } from '@nestjs/common';
import { DocumentNotificationRepository } from '../../domain/interfaces/document-notification.repository.interface';

@Injectable()
export class GetNotificationRulesUseCase {
  constructor(private readonly repo: DocumentNotificationRepository) {}

  async execute(documentId: string) {
    return this.repo.findAllByDocument(documentId);
  }
}
