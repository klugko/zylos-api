import { TaskStatus } from "../enums/task-status.enum";

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly dependencies?: string[]
  ) {}

  updateStatus(status: TaskStatus) {
    if (!Object.values(TaskStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    this.status = status;
  }
}
