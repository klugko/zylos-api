import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ProjectRepository } from "../../domain/interfaces/project-repository.interface";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject("ProjectRepository")
    private readonly projectRepository: ProjectRepository,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException("Projet non trouvé.");
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce projet."
      );
    }

    await this.projectRepository.delete(id);

    await this.activityLogger.logProjectAction(
      userId,
      ActivityAction.PROJECT_DELETED,
      id,
      `Projet "${project.name}" supprimé`,
      `Le projet a été supprimé définitivement`,
      {
        projectName: project.name,
        projectStatus: project.status,
        projectPriority: project.priority,
        clientType: project.clientType,
        industry: project.industry,
      }
    );
  }
}
