import { ChecklistPriority, ChecklistStatus } from '../enums/checklist.enums';
import { Project } from './project.entity';

export class TaskDetails {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: string,
    public priority: string,
    public dueDate: Date | null,
    public startDate: Date | null,
    public endDate: Date | null,
    public progress: number,
    public color: string | null,
    public estimatedTime: number | null,
    public assignedUserId: string | null,
    public projectId: string,
  ) {}
}

export class ChecklistDetails {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly status: ChecklistStatus,
    public readonly priority: ChecklistPriority,
    public readonly assignedUserId?: string
  ) {}
}

export class ProjectWithDetails extends Project {
  constructor(
    base: Project,
    public tasks: TaskDetails[],
    public checklists: ChecklistDetails[],
  ) {
    super(
      base.id, base.name, base.description, base.clientType, base.industry,
      base.color, base.startDate, base.endDate, base.budget,
      base.progress, base.status, base.priority, base.isArchived,
      base.createdAt, base.updatedAt, base.ownerId, base.templateId
    );
  }
}
