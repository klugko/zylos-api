import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { IAIEstimationService } from '@modules/project-management/domain/interfaces/ai-estimation.service.interface';

@Injectable()
export class EstimateProjectUseCase {
  constructor(
    @Inject('IAIEstimationService')
    private readonly aiService: IAIEstimationService,
    @Inject('ProjectRepository')
    private readonly projectRepo: ProjectRepository,
  ) {}

  async execute(projectId: string): Promise<{
    estimatedEndDate: Date;
    estimatedDuration: number;
    estimatedBudget: number;
  }> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundException('Projet introuvable');

    const result = await this.aiService.estimateFromData(projectId);

    await this.projectRepo.updateEstimation(projectId, {
      endDate: result.estimatedEndDate,
      budget: result.estimatedBudget,
    });

    return result;
  }
}
