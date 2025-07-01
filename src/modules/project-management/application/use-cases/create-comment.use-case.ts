import { Injectable, Inject } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { v4 as uuid } from 'uuid';
import { CommentRepository } from '@modules/project-management/domain/interfaces/comment.repository.interface';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    @Inject('CommentRepository')
    private readonly commentRepo: CommentRepository,
  ) {}

  async execute(dto: CreateCommentDto): Promise<Comment> {
    const comment = new Comment(
      uuid(),
      dto.content,
      dto.authorId ?? null,
      new Date(),
      dto.targetType,
      dto.targetId,
    );

    return this.commentRepo.create(comment);
  }
}
