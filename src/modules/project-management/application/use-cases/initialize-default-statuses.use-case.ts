import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { ProjectRepository } from "../../domain/interfaces/project-repository.interface";
import { CustomStatusIntegrationService } from "../services/custom-status-integration.service";

@Injectable()
export class InitializeDefaultStatusesUseCase {
  constructor(
    @Inject("ProjectRepository")
    private readonly projectRepo: ProjectRepository,
    private readonly customStatusIntegrationService: CustomStatusIntegrationService
  ) {}

  async execute(projectId: string): Promise<{ message: string }> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    await this.customStatusIntegrationService.initializeDefaultStatuses(
      projectId
    );

    return {
      message: "Default custom statuses initialized successfully",
    };
  }
}
