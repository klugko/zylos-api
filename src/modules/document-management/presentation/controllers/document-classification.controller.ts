import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ClassifyDocumentUseCase } from '../../application/use-cases/classify-document.usecase';
import { ReclassifyDocumentUseCase } from '../../application/use-cases/reclassify-document.usecase';
import { ClassificationResultDto } from '../../dto/classification-result.dto';
import { GetDocumentClassificationUseCase } from '@modules/document-management/application/use-cases/get-document-classification.usecase';

@ApiTags('Documents - Classification IA')
@Controller('api/documents')
export class DocumentClassificationController {
  constructor(
    private readonly classifyUC: ClassifyDocumentUseCase,
    private readonly reclassifyUC: ReclassifyDocumentUseCase,
    private readonly getUC: GetDocumentClassificationUseCase,
  ) {}

  @Post(':id/classify')
  @ApiOperation({ summary: 'Lancer la classification automatique IA' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async classify(@Param('id') documentId: string) {
    await this.classifyUC.execute(documentId);
    return { message: 'Classification par IA a réussi.' };
  }

  @Post(':id/reclassify')
  @ApiOperation({ summary: 'Corriger manuellement les tags et métadonnées' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  @ApiBody({ type: ClassificationResultDto })
  async reclassify(@Param('id') documentId: string, @Body() dto: ClassificationResultDto) {
    return this.reclassifyUC.execute(documentId, dto);
  }
  
  @Get(':id/classification')
  @ApiOperation({ summary: 'Récupérer la classification générée par IA' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async getClassification(@Param('id') documentId: string) {
    return this.getUC.execute(documentId);
  }
  
}
