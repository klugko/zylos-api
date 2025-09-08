export enum AlertType {
  DURATION_EXCEEDED = "DURATION_EXCEEDED",
  STATUS_STAGNATION = "STATUS_STAGNATION",
  AUTO_SUGGESTION = "AUTO_SUGGESTION",
}

export enum AlertSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export class StatusAlert {
  constructor(
    public readonly id: string,
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly customStatusId: string,
    public type: AlertType,
    public severity: AlertSeverity,
    public message: string,
    public suggestedStatusId: string | null,
    public isResolved: boolean = false,
    public readonly createdAt: Date,
    public resolvedAt: Date | null = null
  ) {}

  resolve() {
    this.isResolved = true;
    this.resolvedAt = new Date();
  }

  updateSeverity(severity: AlertSeverity) {
    this.severity = severity;
  }
}
