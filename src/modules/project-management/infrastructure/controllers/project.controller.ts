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
  // UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  // ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { GetAllProjectsUseCase } from '../../application/use-cases/get-all-projects.use-case';
// import { JwtAuthGuard } from 'src/modules/auth/infrastructure/strategies/jwt-auth.guard';
// import { CurrentUser } from 'src/modules/auth/application/decorators/current-user.decorator';
// import { User } from 'src/modules/auth/domain/entities/user.entity';
import { ProjectWithDetails } from '@modules/project-management/domain/entities/project-with-details.entity';
import { GetAllProjectsWithDetailsUseCase } from '@modules/project-management/application/use-cases/get-all-projects-with-details.use-case';
import { ProjectRepository } from '@modules/project-management/domain/interfaces/project-repository.interface';

@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly getAllProjectsWithDetailsUseCase: GetAllProjectsWithDetailsUseCase,
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
  @ApiOperation({ summary: 'Récupérer un projet par son ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet trouvé', type: Project })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async getById(@Param('id') id: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new HttpException(
          `Projet avec l'ID ${id} introuvable.`,
          HttpStatus.NOT_FOUND,
        );
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
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste de tous les projets' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  async getAll(): Promise<Project[]> {
    return this.getAllProjectsUseCase.execute(); // méthode modifiée sans paramètre
  }

  // @Post()
  // // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Créer un nouveau projet' })
  // @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  // @ApiResponse({ status: 400, description: 'Requête invalide.' })
  // @ApiResponse({ status: 401, description: 'Non autorisé.' })
  // async create(@Body() dto: CreateProjectDto): Promise<Project> {
  //   try {
  //     if (!dto.id) {
  //       throw new HttpException(
  //         'Id est obligatoire (générer un uuid côté client ou revoir la logique).',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     return await this.createProjectUseCase.execute(dto); // sans userId
  //   } catch (error) {
  //     console.error('Erreur lors de la création du projet:', error.message, error.stack);
  //     throw new HttpException(
  //       error?.message ?? 'Erreur inattendue lors de la création du projet.',
  //       error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
 
  @Post()
  @ApiResponse({
    status: 201,
    description: 'Projet créé',
    schema: {
      example: { id: 'uuid', title: 'application web', description: 'Site e-commerce' },
    },
  })
  async create(@Body() dto: CreateProjectDto): Promise<{ id: string; title: string; description: string | null }> {
    const project = await this.createProjectUseCase.execute(dto);
    return { id: project.id, title: project.name, description: project.description };
  }

  @Put(':id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un projet existant' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 403, description: 'Accès refusé. L\'utilisateur n\'est pas autorisé à modifier ce projet.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    try {
      return await this.updateProjectUseCase.execute(id, dto); // sans userId
    } catch (error) {
      throw new HttpException(
        error?.message ?? 'Erreur inattendue lors de la mise à jour du projet.',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
