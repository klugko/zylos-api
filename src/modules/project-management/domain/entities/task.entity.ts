import { TaskStatus, TaskPriority } from "../enums/task.enums";

export class Task {
  progress: number;
  estimatedTime: any;
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public priority: TaskPriority,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly dependencies?: string[],
    public assignedUserId?: string, 
    public columnId?: string
  ) {}

  updateStatus(status: TaskStatus) {
    if (!Object.values(TaskStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
    this.status = status;
  }
}
