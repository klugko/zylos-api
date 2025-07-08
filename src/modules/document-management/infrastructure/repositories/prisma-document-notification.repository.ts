import { Injectable } from '@nestjs/common';
import { DocumentNotificationRepository } from '../../domain/interfaces/document-notification.repository.interface';
import { DocumentNotificationRuleEntity } from '../../domain/entities/document-notification.entity';
import { PrismaService } from '@core/prisma/prisma.service';

@Injectable()
export class PrismaDocumentNotificationRepository extends DocumentNotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(rule: Omit<DocumentNotificationRuleEntity, 'id' | 'createdAt'>): Promise<DocumentNotificationRuleEntity> {
    const result = await this.prisma.documentNotificationRule.create({ data: rule });

    return new DocumentNotificationRuleEntity(
      result.id,
      result.documentId,
      result.trigger as any,
      result.frequency as any,
      result.channel as any,
      result.targetEmail,
      result.targetUrl,
      result.createdAt,
    );
  }

  async findByDocumentAndTrigger(documentId: string, trigger: string): Promise<DocumentNotificationRuleEntity[]> {
    const rules = await this.prisma.documentNotificationRule.findMany({
      where: { documentId, trigger },
    });

    return rules.map((r) =>
      new DocumentNotificationRuleEntity(
        r.id,
        r.documentId,
        r.trigger as any,
        r.frequency as any,
        r.channel as any,
        r.targetEmail,
        r.targetUrl,
        r.createdAt,
      ),
    );
  }

  async findAllByDocument(documentId: string): Promise<DocumentNotificationRuleEntity[]> {
    const rules = await this.prisma.documentNotificationRule.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  
    return rules.map((r) =>
      new DocumentNotificationRuleEntity(
        r.id,
        r.documentId,
        r.trigger as any,
        r.frequency as any,
        r.channel as any,
        r.targetEmail,
        r.targetUrl,
        r.createdAt,
      ),
    );
  }
  
}
