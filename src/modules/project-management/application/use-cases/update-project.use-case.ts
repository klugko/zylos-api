import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateProjectDto } from "../dto/update-project.dto";
import { ProjectRepository } from "../../domain/interfaces/project-repository.interface";
import { Project } from "../../domain/entities/project.entity";
import { TrackingService } from "./tracking-progress";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject("ProjectRepository")
    private readonly projectRepository: ProjectRepository,
    private readonly tracking: TrackingService,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(id: string, dto: UpdateProjectDto, userId): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Projet non trouvé.");
    }
    if (project.ownerId !== userId) {
      throw new NotFoundException(
        "Vous n'êtes pas autorisé à modifier ce projet."
      );
    }

    const oldValues = {
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      progress: project.progress,
    };

    const updated = await this.projectRepository.update(id, dto);

    if (dto.progress !== undefined && dto.progress !== project.progress) {
      this.tracking.emitProjectProgress(id, dto.progress);
    }

    const changes = this.activityLogger.createChangeMetadata(oldValues, dto);

    await this.activityLogger.logProjectAction(
      userId,
      ActivityAction.PROJECT_UPDATED,
      id,
      `Projet "${project.name}" modifié`,
      `Modifications apportées au projet`,
      changes
    );

    return updated;
  }
}
