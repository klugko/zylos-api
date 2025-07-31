import { ChecklistPriority, ChecklistStatus } from '../enums/checklist.enums';

export class Checklist {
  constructor(
    public readonly id: string,
    public title: string,
    public readonly projectId: string,
    public readonly taskId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public status: ChecklistStatus,
    public priority: ChecklistPriority,
    public assignedUserId?: string
  ) {}

  updateStatus(status: ChecklistStatus) {
    this.status = status;
  }

  updatePriority(priority: ChecklistPriority) {
    this.priority = priority;
  }
}
