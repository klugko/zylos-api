import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { TrackingService } from './tracking-progress';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject('ProjectRepository') private readonly projectRepository: ProjectRepository,
    private readonly tracking: TrackingService,
  ) {}

  async execute(id: string, dto: UpdateProjectDto, userId): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Projet non trouvé.');
    }
    if (project.ownerId !== userId) {
      throw new NotFoundException('Vous n\'êtes pas autorisé à modifier ce projet.');
    }

    const updated = await this.projectRepository.update(id, dto);

    if (dto.progress !== undefined && dto.progress !== project.progress) {
      this.tracking.emitProjectProgress(id, dto.progress);
    }

    return updated;
  }
}
