import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
  import { CreateProjectFromPdfUseCase } from '../../application/use-cases/create-project-from-pdf.use-case';
  import { UploadPdfDto } from '../../application/dto/upload-pdf.dto';
  import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
  import { User } from 'src/modules/auth/domain/entities/user.entity';
  
  @ApiTags('Projects')
  @Controller('api/v1/projects')
  export class CreateProjectFromPdfController {
    constructor(private readonly useCase: CreateProjectFromPdfUseCase) {}
  
    @Post('from-pdf')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadPdfDto })
    @ApiOperation({ summary: 'Créer un projet automatiquement à partir d’un document PDF' })
    @ApiResponse({ status: 201, description: 'Projet créé automatiquement depuis le document.' })
    @ApiResponse({ status: 400, description: 'Fichier manquant ou invalide.' })
    @UseInterceptors(FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdf',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.pdf$/)) {
          return cb(new HttpException('Only PDF files are allowed!', HttpStatus.BAD_REQUEST), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }))
    async handleUpload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
      if (!file) {
        throw new HttpException('Fichier PDF requis.', HttpStatus.BAD_REQUEST);
      }
      return this.useCase.execute(file.path, user.id);
    }
  }