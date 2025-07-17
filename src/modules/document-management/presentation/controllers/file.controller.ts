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

    @Get('document/:filePath')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get document file by URL path' })
    @ApiParam({ name: 'filePath', description: 'URL-encoded file path' })
    @Header('Cache-Control', 'public, max-age=3600')
    async getDocumentByPath(
      @Param('filePath') filePath: string,
      @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
      // Decode URL path
      const decodedPath = decodeURIComponent(filePath);
      const fullPath = join(process.cwd(), decodedPath);
  
      // Verify document exists in database
      const document = await this.documentRepo.findByUrl(decodedPath);
      if (!document) {
        throw new NotFoundException('Document not found or access denied');
      }
  
      // Determine content type
      const contentType = this.getContentType(decodedPath);
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${document.name}"`,
      });
  
      return new StreamableFile(createReadStream(fullPath));
    }
  
    private getContentType(filePath: string): string {
      const extension = filePath.split('.').pop()?.toLowerCase() || 'bin';
      const typeMap: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        csv: 'text/csv',
        html: 'text/html',
      };
  
      return typeMap[extension] || 'application/octet-stream';
    }
  }