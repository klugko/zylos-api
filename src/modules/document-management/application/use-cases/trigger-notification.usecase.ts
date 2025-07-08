import { Injectable } from '@nestjs/common';
import { DocumentNotificationRepository } from '../../domain/interfaces/document-notification.repository.interface';

@Injectable()
export class TriggerNotificationUseCase {
  constructor(private readonly repo: DocumentNotificationRepository) {}

  async execute(documentId: string, trigger: 'new_comment' | 'new_version') {
    const rules = await this.repo.findByDocumentAndTrigger(documentId, trigger);

    for (const rule of rules) {
      if (rule.channel === 'email' && rule.targetEmail) {
        console.log(`Envoi email à ${rule.targetEmail}`);
        // TODO: intégration SMTP
      } else if (rule.channel === 'webhook' && rule.targetUrl) {
        console.log(`🔗 POST vers ${rule.targetUrl}`);
        // TODO: intégration HTTP webhook
      } else {
        console.log(`Notification in-app à créer`);
      }
    }

    return { triggered: rules.length };
  }
}
