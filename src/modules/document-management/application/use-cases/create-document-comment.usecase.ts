import { Injectable } from '@nestjs/common';
import { DocumentCommentRepository } from '../../domain/interfaces/document-comment.repository.interface';
import { CreateDocumentCommentDto } from '../../dto/create-document-comment.dto';

@Injectable()
export class CreateDocumentCommentUseCase {
  constructor(private readonly repo: DocumentCommentRepository) {}

  async execute(documentId: string, dto: CreateDocumentCommentDto) {
    return this.repo.create({
      documentId,
      content: dto.content,
      zone: dto.zone ?? null,
    });
  }
}
