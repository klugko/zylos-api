import { Controller, Get, Param, Post } from '@nestjs/common';
import { GetDocumentVersionsUseCase } from '../../application/use-cases/get-document-versions.usecase';
import { RestoreDocumentVersionUseCase } from '../../application/use-cases/restore-document-version.usecase';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Documents - Versions')
@Controller('api/documents')
export class DocumentVersionController {
  constructor(
    private readonly getUC: GetDocumentVersionsUseCase,
    private readonly restoreUC: RestoreDocumentVersionUseCase,
  ) {}

  @Get(':id/versions')
  @ApiOperation({ summary: 'Lister toutes les versions d’un document' })
  @ApiParam({ name: 'id', description: 'ID du document', example: 'doc_123' })
  async list(@Param('id') documentId: string) {
    return this.getUC.execute(documentId);
  }

  @Post(':id/restore/:versionId')
  @ApiOperation({ summary: 'Restaurer une version antérieure comme courante' })
  @ApiParam({ name: 'id', description: 'ID du document courant' })
  @ApiParam({ name: 'versionId', description: 'ID de la version à restaurer' })
  async restore(
    @Param('id') documentId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.restoreUC.execute(documentId, versionId);
  }
}
