import { DocumentNotificationRuleEntity } from '../entities/document-notification.entity';

export abstract class DocumentNotificationRepository {
  abstract save(rule: Omit<DocumentNotificationRuleEntity, 'id' | 'createdAt'>): Promise<DocumentNotificationRuleEntity>;
  abstract findByDocumentAndTrigger(documentId: string, trigger: string): Promise<DocumentNotificationRuleEntity[]>;
  abstract findAllByDocument(documentId: string): Promise<DocumentNotificationRuleEntity[]>;
}
