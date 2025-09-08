import { ActivityType, ActivityAction } from "../enums/activity.enums";

export class ActivityLog {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly projectId: string | null,
    public readonly taskId: string | null,
    public readonly documentId: string | null,
    public readonly surveyId: string | null,
    public readonly type: ActivityType,
    public readonly action: ActivityAction,
    public readonly title: string,
    public readonly description: string | null,
    public readonly metadata: Record<string, any> | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly createdAt: Date
  ) {}

  public isProjectRelated(): boolean {
    return this.projectId !== null;
  }

  public isTaskRelated(): boolean {
    return this.taskId !== null;
  }

  public isDocumentRelated(): boolean {
    return this.documentId !== null;
  }

  public isSurveyRelated(): boolean {
    return this.surveyId !== null;
  }

  public isUserAction(): boolean {
    return this.type === ActivityType.USER;
  }

  public isSystemAction(): boolean {
    return this.type === ActivityType.SYSTEM;
  }

  public hasMetadata(): boolean {
    return this.metadata !== null && Object.keys(this.metadata).length > 0;
  }

  public getMetadataValue(key: string): any {
    return this.metadata?.[key] || null;
  }

  public getOldValue(): any {
    return this.getMetadataValue("oldValue");
  }

  public getNewValue(): any {
    return this.getMetadataValue("newValue");
  }

  public getChanges(): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};
    const oldValues = this.getMetadataValue("oldValues") || {};
    const newValues = this.getMetadataValue("newValues") || {};

    Object.keys(newValues).forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          old: oldValues[key],
          new: newValues[key],
        };
      }
    });

    return changes;
  }

  public getFormattedTitle(): string {
    return this.title;
  }

  public getFormattedDescription(): string {
    if (!this.description) return "";

    let formatted = this.description;

    if (this.metadata) {
      Object.entries(this.metadata).forEach(([key, value]) => {
        if (typeof value === "string" || typeof value === "number") {
          formatted = formatted.replace(`{${key}}`, String(value));
        }
      });
    }

    return formatted;
  }

  public getRelativeTime(): string {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - this.createdAt.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Il y a quelques secondes";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    } else {
      return this.createdAt.toLocaleDateString("fr-FR");
    }
  }
}
