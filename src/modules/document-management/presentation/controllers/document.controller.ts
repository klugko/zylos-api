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
  HttpStatus
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Documents')
@Controller('api/v1/documents')
export class DocumentController {
  constructor(
    private readonly uploadUC: UploadDocumentUseCase,
    private readonly getUC: GetProjectDocumentsUseCase,
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
}