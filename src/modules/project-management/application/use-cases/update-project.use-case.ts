import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';


@Injectable()
export class UpdateProjectUseCase {
   constructor(@Inject('ProjectRepository') private readonly projectRepository: ProjectRepository
  ) {}

  async execute(id: string, dto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Projet non trouvé.');
    }
  
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Accès refusé. Vous n’êtes pas propriétaire du projet.');
    }
  
    return this.projectRepository.update(id, dto);
  }
  
}
