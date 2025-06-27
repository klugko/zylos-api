import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  HttpException,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { GetAllProjectsUseCase } from '../../application/use-cases/get-all-projects.use-case';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';


@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste de tous les projets' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async getAll(@CurrentUser() user: User): Promise<Project[]> {
    return this.getAllProjectsUseCase.execute(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: User,
  ): Promise<Project> {
    try {
      if (!dto.id) {
        throw new HttpException(
          'Id est obligatoire (générer un uuid côté client ou revoir la logique).',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.createProjectUseCase.execute(dto, user.id);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error.message, error.stack);
      throw new HttpException(
        error?.message ?? 'Erreur inattendue lors de la création du projet.',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un projet existant' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Accès refusé. L\'utilisateur n\'est pas autorisé à modifier ce projet.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User,
  ): Promise<Project> {
    try {
      return await this.updateProjectUseCase.execute(id, dto, user.id);
    } catch (error) {
      throw new HttpException(
        error?.message ?? 'Erreur inattendue lors de la mise à jour du projet.',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
