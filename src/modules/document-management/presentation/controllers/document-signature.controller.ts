import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { InitiateSignatureUseCase } from '../../application/use-cases/initiate-signature.usecase';
import { SubmitSignatureUseCase } from '../../application/use-cases/submit-signature.usecase';
import { SubmitSignatureDto } from '../../dto/submit-signature.dto';
import { DocumentSignatureRepository } from '../../domain/interfaces/document-signature.repository.interface';

@ApiTags('Documents - Signature')
@Controller('api/documents')
export class DocumentSignatureController {
  constructor(
    private readonly initiateUC: InitiateSignatureUseCase,
    private readonly submitUC: SubmitSignatureUseCase,
    private readonly repo: DocumentSignatureRepository,
  ) {}

  @Post(':id/sign')
  @ApiOperation({ summary: 'Initialiser la demande de signature' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async init(@Param('id') documentId: string) {
    return this.initiateUC.execute(documentId);
  }

  @Post(':id/sign/submit')
  @ApiOperation({ summary: 'Soumettre une signature (image base64)' })
  @ApiBody({ type: SubmitSignatureDto })
  async sign(@Param('id') documentId: string, @Body() dto: SubmitSignatureDto) {
    return this.submitUC.execute(documentId, dto.base64Image);
  }

  @Get(':id/signature')
  @ApiOperation({ summary: 'Consulter le statut de la signature' })
  async status(@Param('id') documentId: string) {
    return this.repo.getByDocumentId(documentId);
  }
}
