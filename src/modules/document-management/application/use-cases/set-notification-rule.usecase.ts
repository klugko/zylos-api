import { Injectable } from '@nestjs/common';
import { DocumentNotificationRepository } from '../../domain/interfaces/document-notification.repository.interface';
import { SetNotificationRuleDto } from '../../dto/set-notification-rule.dto';

@Injectable()
export class SetNotificationRuleUseCase {
  constructor(private readonly repo: DocumentNotificationRepository) {}

  async execute(documentId: string, dto: SetNotificationRuleDto) {
    return this.repo.save({
      documentId,
      trigger: dto.trigger,
      frequency: dto.frequency,
      channel: dto.channel,
      targetEmail: dto.targetEmail ?? null,
      targetUrl: dto.targetUrl ?? null,
    });
  }
}
