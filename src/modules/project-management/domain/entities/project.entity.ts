import { ChecklistPriority, ChecklistStatus } from '../enums/checklist.enums';
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';

export class Project {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public clientType: string,
    public industry: string | null,
    public color: string | null,
    public startDate: Date | null,
    public endDate: Date | null,
    public budget: number | null,
    public progress: number,
    public status: string,
    public priority: string,
    public isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public ownerId: string | null,
    public templateId: string | null,
  ) {}

  public owner?: {
    id: string;
    fullname: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    skills: string[];
    availability: number;
    performanceScore: number;
    createdAt: Date;
    updatedAt: Date;
  };

  archive(): void {
    if (this.isArchived) {
      throw new Error('Project is already archived.');
    }
    this.isArchived = true;
  }
}