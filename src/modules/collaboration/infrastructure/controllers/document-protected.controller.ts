import {
    Controller,
    Get,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
    ForbiddenException,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
  } from '@nestjs/swagger';
  import { PrismaService } from 'src/core/prisma/prisma.service';
  import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
  import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
  import { User } from 'src/modules/auth/domain/entities/user.entity';
  import { AccessControlService } from '../../application/services/access-control.service';
  
  @ApiTags('Collaboration - Documents')
  @Controller('api/v1/collaboration/documents')
  export class DocumentProtectedController {
    constructor(
      private readonly prisma: PrismaService,
      private readonly accessService: AccessControlService,
    ) {}
  
    @Get(':documentId/details')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Récupérer les détails d’un document si autorisé' })
    @ApiParam({ name: 'documentId', description: 'ID du document' })
    @ApiResponse({ status: 200, description: 'Détails du document renvoyés' })
    @ApiResponse({ status: 403, description: 'Accès refusé' })
    async getDocumentDetails(@Param('documentId') documentId: string, @CurrentUser() user: User) {
      try {
        await this.accessService.ensureDocumentAccess(user.id, documentId, 'read');
        const document = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
          throw new HttpException(`Document ${documentId} introuvable`, HttpStatus.NOT_FOUND);
        }
        return document;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        throw new HttpException(
          error?.message ?? 'Erreur inattendue lors de la récupération du document.',
          error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  