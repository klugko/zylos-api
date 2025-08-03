import { CommentTargetType } from "../enums/comment.enums";
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';

export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly authorId: string | null,
    public readonly createdAt: Date,
    public readonly targetType: CommentTargetType,
    public readonly targetId: string,
  ) {}

  public author?: {
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
}