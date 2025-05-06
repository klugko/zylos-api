import {
  Body,
  Query,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
import { GetProjectTasksByViewUseCase } from '../../application/use-cases/get-project-tasks-by-view.use-case';


@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(
    private readonly createProject: CreateProjectUseCase,
    private readonly projectRepo: PrismaProjectRepository,
    private readonly getTasksByViews: GetProjectTasksByViewUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un projet' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès' })
  async create(@Body() dto: CreateProjectDto) {
    return await this.createProject.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste des projets retournée avec succès' })
  async findAll() {
    return await this.projectRepo.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un projet par ID' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Projet trouvé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return project;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet à modifier' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);

    project.name = dto.name ?? project.name;
    project.description = dto.description ?? project.description;
    project.type = dto.type ?? project.type;

    return await this.projectRepo.update(project);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet à supprimer' })
  @ApiResponse({ status: 200, description: 'Projet supprimé avec succès' })
  async delete(@Param('id') id: string) {
    await this.projectRepo.delete(id);
    return { message: 'Deleted successfully' };
  }
}
