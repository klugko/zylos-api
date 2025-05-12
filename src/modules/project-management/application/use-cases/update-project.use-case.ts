import { Inject, Injectable } from '@nestjs/common';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';


@Injectable()
export class UpdateProjectUseCase {
   constructor(@Inject('ProjectRepository') private readonly projectRepository: ProjectRepository
  ) {}

  async execute(id: string, dto: UpdateProjectDto): Promise<Project> {
    return this.projectRepository.update(id, dto);
  }
}
