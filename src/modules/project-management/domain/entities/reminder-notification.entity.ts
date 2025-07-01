export class ReminderNotification {
    constructor(
      public readonly id: string,
      public readonly title: string,
      public readonly message: string,
      public readonly userId: string,
      public readonly taskId: string,
      public readonly createdAt: Date,
    ) {}
  }
  