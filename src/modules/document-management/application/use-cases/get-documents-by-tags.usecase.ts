import { Injectable } from '@nestjs/common';
import { DocumentRepository } from '../../domain/interfaces/document.repository.interface';
import { DocumentTag } from '../../domain/enums/document-tags.enum';

@Injectable()
export class GetDocumentsByTagsUseCase {
  constructor(private readonly documentRepo: DocumentRepository) {}

  async execute(tags: DocumentTag[], projectId?: string): Promise<any[]> {
    const validTags = tags.filter(tag => 
      Object.values(DocumentTag).includes(tag)
    );
    
    if (validTags.length === 0) {
      throw new Error('No valid tags provided');
    }

    return this.documentRepo.findByTags(validTags, projectId);
  }
}