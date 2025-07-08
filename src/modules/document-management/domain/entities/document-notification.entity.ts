export class DocumentNotificationRuleEntity {
    constructor(
      public readonly id: string,
      public readonly documentId: string,
      public readonly trigger: 'new_comment' | 'new_version',
      public readonly frequency: 'immediate' | 'daily' | 'weekly',
      public readonly channel: 'in-app' | 'email' | 'webhook',
      public readonly targetEmail: string | null,
      public readonly targetUrl: string | null,
      public readonly createdAt: Date,
    ) {}
  }
  