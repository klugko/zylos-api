// src/modules/project-management/application/use-cases/create-project.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class CreateProjectUseCase {
  constructor(@Inject('ProjectRepository') private readonly projectRepository: ProjectRepository) {}

  /**
   * @method execute
   * @param {CreateProjectDto} dto - Les données du projet à créer (sans ownerId).
   * @param {string} ownerId - L'ID de l'utilisateur propriétaire du projet, extrait du token.
   * @returns {Promise<Project>} Le projet créé.
   * @description Crée une nouvelle entité Project à partir du DTO et de l'ownerId fourni,
   * puis la persiste via le ProjectRepository.
   */
  async execute(dto: CreateProjectDto): Promise<Project> {
    const project = new Project(
      dto.id,
      dto.name,
      dto.description ?? null,
      dto.clientType,
      dto.industry ?? null,
      dto.color ?? null,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.endDate ? new Date(dto.endDate) : null,
      dto.budget ?? null,
      0,
      dto.status ?? 'NOT_STARTED',
      dto.priority ?? 'MEDIUM',
      dto.isArchived ?? false,
      new Date(),
      new Date(), 
      null,    
      dto.templateId ?? null,
    );

    return this.projectRepository.create(project);
  }
}
