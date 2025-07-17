import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  HttpStatus,
  ParseArrayPipe,
  Query
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
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { Response } from 'express';
import { GetDocumentsByTagsUseCase } from '@modules/document-management/application/use-cases/get-documents-by-tags.usecase';
import { DocumentTag } from '@modules/document-management/domain/enums/document-tags.enum';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentController {
  constructor(
    private readonly uploadUC: UploadDocumentUseCase,
    private readonly getUC: GetProjectDocumentsUseCase,
    private readonly getByTagsUC: GetDocumentsByTagsUseCase,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a project-related document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', example: 'proj_123' },
        type: { type: 'string', example: 'Contract' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['projectId', 'file'],
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() user: User,
    @Res() res: Response
  ) {
    try {
      const document = await this.uploadUC.execute(file, dto, user.id);
      return res.status(HttpStatus.CREATED).json(document);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Document upload failed',
        error: error.message
      });
    }
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'List project documents' })
  @ApiParam({ name: 'projectId', example: 'proj_123' })
  async getAll(@Param('projectId') projectId: string) {
    return this.getUC.execute(projectId);
  }

  @Get('search/by-tags')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve documents by tags' })
  @ApiQuery({
    name: 'tags',
    description: 'Document tags to search for',
    type: [String],
    enum: Object.values(DocumentTag),
    example: [DocumentTag.CC, DocumentTag.FA],
    required: true
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Optional project ID to filter results',
    required: false,
    example: '25342739-0fb2-4725-898a-09f7f984421f'
  })
  async getDocumentsByTags(
    @Query('tags', new ParseArrayPipe({ items: String, separator: ',' })) tags: string[],
    @Query('projectId') projectId?: string,
    @Res() res?: Response
  ) {
    try {
      // Convert to DocumentTag enum and filter valid values
      const validTags = tags
        .map(tag => tag.toUpperCase())
        .filter(tag => Object.values(DocumentTag).includes(tag as DocumentTag)) as DocumentTag[];
      
      if (validTags.length === 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No valid tags provided',
          validTags: Object.values(DocumentTag)
        });
      }

      const documents = await this.getByTagsUC.execute(validTags, projectId);
      return res.status(HttpStatus.OK).json(documents);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to retrieve documents',
        error: error.message
      });
    }
  }
}