import { User } from "@modules/auth/domain/entities/user.entity";
import { ChecklistPriority, ChecklistStatus } from "@modules/project-management/domain/enums/checklist.enums";

export class ChecklistResponseDto {
  id: string;
  title: string;
  projectId: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  status: ChecklistStatus;
  priority: ChecklistPriority;
  assignedUserId?: string;
  assignedUser?: User;

  constructor(checklist: any) {
    this.id = checklist.id;
    this.title = checklist.title;
    this.projectId = checklist.projectId;
    this.taskId = checklist.taskId;
    this.createdAt = checklist.createdAt;
    this.updatedAt = checklist.updatedAt;
    this.status = checklist.status;
    this.priority = checklist.priority;
    this.assignedUserId = checklist.assignedUserId;
    this.assignedUser = checklist.assignedUser;
  }
}