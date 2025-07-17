import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { UploadDocumentUseCase } from '../../application/use-cases/upload-document.usecase';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { UploadDocumentDto } from '../../dto/upload-document.dto';
  import { GetProjectDocumentsUseCase } from '../../application/use-cases/get-project-documents.usecase';
  import {
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiParam,
  } from '@nestjs/swagger';
  
  @ApiTags('Documents')
  @Controller('api/v1/documents')
  export class DocumentController {
    constructor(
      private readonly uploadUC: UploadDocumentUseCase,
      private readonly getUC: GetProjectDocumentsUseCase,
    ) {}
  
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Uploader un document lié à un projet' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', example: 'proj_123' },
          type: { type: 'string', example: 'Contrat' },
          file: {
            type: 'string',
            format: 'binary',
          },
        },
        required: ['projectId', 'type', 'file'],
      },
    })
    async upload(
      @UploadedFile() file: Express.Multer.File,
      @Body() dto: UploadDocumentDto,
    ) {
      return this.uploadUC.execute(file, dto);
    }
  
    @Get(':projectId')
    @ApiOperation({ summary: 'Lister les documents d’un projet' })
    @ApiParam({ name: 'projectId', example: 'proj_123' })
    async getAll(@Param('projectId') projectId: string) {
      return this.getUC.execute(projectId);
    }
  }
  