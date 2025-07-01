import { CommentTargetType } from "../enums/comment.enums";

export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly authorId: string | null,
    public readonly createdAt: Date,
    public readonly targetType: CommentTargetType,
    public readonly targetId: string,
  ) {}
}
