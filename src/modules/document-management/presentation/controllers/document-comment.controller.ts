import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { CreateDocumentCommentUseCase } from '../../application/use-cases/create-document-comment.usecase';
import { GetDocumentCommentsUseCase } from '../../application/use-cases/get-document-comments.usecase';
import { CreateDocumentCommentDto } from '../../dto/create-document-comment.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { DocumentCommentRepository } from '../../domain/interfaces/document-comment.repository.interface';


@ApiTags('Documents - Commentaires')
@Controller('api/documents')
export class DocumentCommentController {
  constructor(
    private readonly createUC: CreateDocumentCommentUseCase,
    private readonly getUC: GetDocumentCommentsUseCase,
    private readonly repo: DocumentCommentRepository,
  ) {}

  @Post(':id/comments')
  @ApiOperation({ summary: 'Ajouter un commentaire à un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiBody({ type: CreateDocumentCommentDto })
  async comment(@Param('id') documentId: string, @Body() dto: CreateDocumentCommentDto) {
    return this.createUC.execute(documentId, dto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Lister les commentaires d’un document' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async list(@Param('id') documentId: string) {
    return this.getUC.execute(documentId);
  }

  @Patch('comments/:commentId/resolve')
  @ApiOperation({ summary: 'Marquer un commentaire comme résolu' })
  @ApiParam({ name: 'commentId', description: 'ID du commentaire à résoudre' })
  async resolve(@Param('commentId') commentId: string) {
    return this.repo.resolve(commentId);
  }
}
