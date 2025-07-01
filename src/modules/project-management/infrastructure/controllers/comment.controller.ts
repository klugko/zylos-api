import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Inject,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
  import { CreateCommentDto } from '../../application/dto/create-comment.dto';
  import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
  import { Comment } from '../../domain/entities/comment.entity';
import { CommentRepository } from '@modules/project-management/domain/interfaces/comment.repository.interface';
import { CommentTargetType } from '@modules/project-management/domain/enums/comment.enums';
  
  @ApiTags('Comments')
  @Controller('api/v1/comments')
  export class CommentController {
    constructor(
      private readonly createCommentUseCase: CreateCommentUseCase,
      @Inject('CommentRepository')
      private readonly commentRepo: CommentRepository,
    ) {}
  
    @Post()
    @ApiOperation({ summary: 'Créer un commentaire (projet, tâche ou checklist)' })
    async create(@Body() dto: CreateCommentDto): Promise<Comment> {
      return this.createCommentUseCase.execute(dto);
    }
  
    @Get()
    @ApiOperation({ summary: 'Lister les commentaires pour un élément donné' })
    @ApiQuery({ name: 'targetType', enum: CommentTargetType })
    @ApiQuery({ name: 'targetId', type: String })
    async getByTarget(
      @Query('targetType') targetType: CommentTargetType,
      @Query('targetId') targetId: string,
    ): Promise<Comment[]> {
      return this.commentRepo.findByTarget(targetType, targetId);
    }
  }
  