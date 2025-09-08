import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { IProjectRepository } from "../../domain/interfaces/project-repository.interface";
import { CustomStatus } from "../../domain/entities/custom-status.entity";

@Injectable()
export class GetCustomStatusesUseCase {
  constructor(
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("ProjectRepository")
    private readonly projectRepo: IProjectRepository
  ) {}

  async execute(
    projectId: string,
    activeOnly: boolean = true
  ): Promise<CustomStatus[]> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (activeOnly) {
      return await this.customStatusRepo.findByProjectIdAndActive(projectId);
    }

    return await this.customStatusRepo.findByProjectId(projectId);
  }
}
