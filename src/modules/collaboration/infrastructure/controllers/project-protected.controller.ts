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
    ApiResponse,
    ApiParam,
  } from '@nestjs/swagger';
  import { PrismaService } from 'src/core/prisma/prisma.service';
  import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
  import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
  import { User } from 'src/modules/auth/domain/entities/user.entity';
  import { AccessControlService } from '../../application/services/access-control.service';
  
  @ApiTags('Collaboration - Projects')
  @Controller('api/v1/collaboration/projects')
  export class ProjectProtectedController {
    constructor(
      private readonly prisma: PrismaService,
      private readonly accessService: AccessControlService,
    ) {}
  
    @Get(':projectId/details')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Récupérer les détails d’un projet si autorisé' })
    @ApiParam({ name: 'projectId', description: 'ID du projet' })
    @ApiResponse({ status: 200, description: 'Détails du projet renvoyés' })
    @ApiResponse({ status: 403, description: 'Accès refusé' })
    async getProjectDetails(@Param('projectId') projectId: string, @CurrentUser() user: User) {
      try {
        await this.accessService.ensureProjectAccess(user.id, projectId, 'read');
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
          throw new HttpException(`Projet ${projectId} introuvable`, HttpStatus.NOT_FOUND);
        }
        return project;
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        throw new HttpException(
          error?.message ?? 'Erreur inattendue lors de la récupération du projet.',
          error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Lister tous les projets accessibles à l’utilisateur' })
    @ApiResponse({ status: 200, description: 'Liste des projets accessibles' })
    async getAccessibleProjects(@CurrentUser() user: User) {
      // On filtre les projets auxquels l’utilisateur a accès (propriétaire ou ProjectAccess)
      const owned = await this.prisma.project.findMany({ where: { ownerId: user.id } });
      const accessRecords = await this.prisma.projectAccess.findMany({ where: { userId: user.id } });
      const accessibleIds = accessRecords.map(a => a.projectId);
      const shared = accessibleIds.length > 0
        ? await this.prisma.project.findMany({ where: { id: { in: accessibleIds } } })
        : [];
      return [...owned, ...shared];
    }
  }
  