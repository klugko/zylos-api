import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  HttpException,
  HttpStatus,
  Get,
  Inject,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { GetAllProjectsUseCase } from '../../application/use-cases/get-all-projects.use-case';
import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { ProjectWithDetails } from '@modules/project-management/domain/entities/project-with-details.entity';
import { GetAllProjectsWithDetailsUseCase } from '@modules/project-management/application/use-cases/get-all-projects-with-details.use-case';
import { ProjectRepository } from '@modules/project-management/domain/interfaces/project-repository.interface';
import { GetProjectProgressUseCase } from '@modules/project-management/application/use-cases/get-project-progress.use-case';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';

@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly getAllProjectsWithDetailsUseCase: GetAllProjectsWithDetailsUseCase,
    private readonly getProjectProgressUseCase: GetProjectProgressUseCase,
    @Inject('ProjectRepository') 
    private readonly projectRepository: ProjectRepository,
  ) {}

  @Get('details')
  @ApiOperation({ summary: 'Get all projects with their tasks and checklists' })
  @ApiResponse({
    status: 200,
    description: 'All projects including their tasks and checklists',
    type: [ProjectWithDetails],
  })
  async getAllProjectsWithDetails(): Promise<{ data: ProjectWithDetails[] }> {
    const projects = await this.getAllProjectsWithDetailsUseCase.execute();
    return { data: projects };
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer un projet par son ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet trouvé', type: Project })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async getById(@Param('id') id: string, @CurrentUser() user: User): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new HttpException(
          `Projet avec l'ID ${id} introuvable.`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (project.ownerId !== user.id) {
        throw new ForbiddenException("Vous n'avez pas accès à ce projet.");
      }
      return project;
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      throw new HttpException(
        error?.message || 'Erreur inattendue.',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
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
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Projet créé',
    schema: {
      example: { id: 'uuid', title: 'application web', description: 'Site e-commerce' },
    },
  })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: User): 
    Promise<{ id: string; title: string; description: string | null }> {
    const project = await this.createProjectUseCase.execute(dto, user.id);
    return {
      id: project.id,
      title: project.name,
      description: project.description,
    };
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Récupérer l’avancement du projet (en %)' })
  async getProgress(@Param('id') id: string) {
    return this.getProjectProgressUseCase.execute(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
