import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('ProjectRepository') private readonly repository: ProjectRepository
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    const now = new Date();
    const project = new Project(
      uuidv4(),
      dto.name,
      dto.description ?? null,
      dto.type,
      false,
      now,
      now
    );

    return await this.repository.create(project);
  }
}