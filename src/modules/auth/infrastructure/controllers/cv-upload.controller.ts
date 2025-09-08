import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    UseGuards,
    HttpStatus,
    Res,
    BadRequestException,
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
  import { Response } from 'express';
  import { JwtAuthGuard } from '../strategies/jwt-auth.guard';
  import { CurrentUser } from '../../application/decorators/current-user.decorator';
  import { User } from '../../domain/entities/user.entity';
  import { UploadCvDto, UploadCvBodyDto } from '../../application/dto/upload-cv.dto';
  import { UploadCvUseCase } from '../../application/use-cases/upload-cv.use-case';
  
  @ApiTags('CV Upload')
  @Controller('api/v1/auth')
  export class CvUploadController {
    constructor(private readonly uploadCvUseCase: UploadCvUseCase) {}
  
    @Post('upload-cv')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Uploader un CV et extraire les compétences' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Fichier CV (PDF ou DOCX)',
          },
          type: {
            type: 'string',
            example: 'CV',
            description: 'Type de document (optionnel)',
          },
        },
        required: ['file'],
      },
    })
    @ApiResponse({
      status: 201,
      description: 'CV uploadé avec succès et compétences extraites',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          skills: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
          fileUrl: { type: 'string' },
        },
      },
    })
    @ApiResponse({
      status: 400,
      description: 'Fichier manquant ou format non supporté',
    })
    @ApiResponse({
      status: 500,
      description: 'Erreur lors du traitement du CV',
    })
    async uploadCv(
      @UploadedFile() file: Express.Multer.File,
      @Body() dto: UploadCvBodyDto,
      @CurrentUser() user: User,
      @Res() res: Response,
    ) {
      if (!file) {
        throw new BadRequestException('Fichier CV requis');
      }
  
      // Vérifier le type de fichier
      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
  
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Format de fichier non supporté. Formats acceptés: PDF, DOCX',
        );
      }
  
      // Vérifier la taille du fichier (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException('Fichier trop volumineux. Taille maximale: 10MB');
      }
  
      try {
        const result = await this.uploadCvUseCase.execute(file, dto, user.id);
        return res.status(HttpStatus.CREATED).json(result);
      } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur lors du traitement du CV',
          error: error.message,
        });
      }
    }
  }
  