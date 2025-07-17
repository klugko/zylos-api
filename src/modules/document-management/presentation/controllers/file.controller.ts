import {
    Controller,
    Get,
    Param,
    Res,
    StreamableFile,
    Header,
    NotFoundException,
    UseGuards
  } from '@nestjs/common';
  import { Response } from 'express';
  import { createReadStream } from 'fs';
  import { join } from 'path';
  import { DocumentRepository } from '@modules/document-management/domain/interfaces/document.repository.interface';
  import { ApiTags, ApiParam, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
  
  @ApiTags('Files')
  @Controller('api/v1/files')
  export class FileController {
    constructor(private readonly documentRepo: DocumentRepository) {}
  
    @Get('document/:documentId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get document file by ID' })
    @ApiParam({ name: 'documentId', example: '47643a04-45e6-443a-a1e7-60c4c259974d' })
    async getDocumentFile(
      @Param('documentId') documentId: string,
      @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
      const document = await this.documentRepo.findById(documentId);
      if (!document) {
        throw new NotFoundException('Document not found');
      }
  
      const filePath = join(process.cwd(), document.url);
      const fileStream = createReadStream(filePath);
      const extension = document.url.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'doc':
          contentType = 'application/msword';
          break;
        case 'docx':
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xls':
          contentType = 'application/vnd.ms-excel';
          break;
        case 'xlsx':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
      }
  
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.name}"`,
      });
  
      return new StreamableFile(fileStream);
    }
  }