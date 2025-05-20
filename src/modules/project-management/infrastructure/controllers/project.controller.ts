import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateProjectDto } from '../../application/dto/create-project.dto';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { GetAllProjectsUseCase } from '../../application/use-cases/get-all-projects.use-case';


@ApiTags('Projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les projets' })
  @ApiResponse({ status: 200, description: 'Liste de tous les projets' })
  async getAll() {
    return this.getAllProjectsUseCase.execute();
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Requête invalide.' })
  async create(@Body() dto: CreateProjectDto): Promise<Project> {
    try {
      if (!dto.id) {
        throw new HttpException(
          'Id est obligatoire (générer un uuid).',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.createProjectUseCase.execute(dto);
    } catch (error) {
      throw new HttpException(
        error?.message ?? 'Erreur lors de la création du projet.',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet existant' })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    try {
      return await this.updateProjectUseCase.execute(id, dto);
    } catch (error) {
      throw new HttpException(
        error?.message ?? 'Erreur lors de la mise à jour du projet.',
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
