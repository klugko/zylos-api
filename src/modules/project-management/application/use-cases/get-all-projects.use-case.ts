import { Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';

@Injectable()
export class GetAllProjectsUseCase {
   constructor(@Inject('ProjectRepository') private readonly projectRepository: ProjectRepository
  ) {}

  async execute(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }
}
