import { Inject, Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { ProjectWithDetails } from '../../domain/entities/project-with-details.entity';

@Injectable()
export class GetAllProjectsWithDetailsUseCase {
  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(): Promise<ProjectWithDetails[]> {
    return this.projectRepository.findAllWithDetails();
  }
}
