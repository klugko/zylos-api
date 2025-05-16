import { Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';
import { v4 as uuid } from 'uuid';


@Injectable()
export class CreateProjectUseCase {
  constructor(@Inject('ProjectRepository') private readonly projectRepository: ProjectRepository
) {}

  async execute(dto: CreateProjectDto, ownerId: string): Promise<Project> {
    const project = new Project(
      uuid(),
      dto.name,
      dto.description || null,
      dto.clientType,
      dto.industry || null,
      dto.color || null,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.endDate ? new Date(dto.endDate) : null,
      dto.budget ?? null,
      0,
      dto.status || 'NOT_STARTED',
      dto.priority || 'MEDIUM',
      dto.isArchived || false,
      new Date(),
      new Date(),
      dto.ownerId || null,
      dto.templateId || null,
    );

    return this.projectRepository.create(project);
  }
}
