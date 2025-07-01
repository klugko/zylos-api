import { Comment } from '../entities/comment.entity';
import { CommentTargetType } from '../enums/comment.enums';

export interface CommentRepository {
  create(comment: Comment): Promise<Comment>;
  findByTarget(
    targetType: CommentTargetType,
    targetId: string
  ): Promise<Comment[]>;
}
