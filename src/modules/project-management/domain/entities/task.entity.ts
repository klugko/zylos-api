export class Task {
    constructor(
      public readonly id: string,
      public title: string,
      public description: string | null,
      public status: TaskStatus,
      public readonly projectId: string,
      public readonly createdAt: Date,
      public readonly updatedAt: Date,
    ) {}
  
    updateStatus(status: TaskStatus) {
      if (!Object.values(TaskStatus).includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      this.status = status;
    }
  }
  
  export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
  }
  