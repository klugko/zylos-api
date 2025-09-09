import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ProjectSimulation } from '../../domain/entities/simulation.entity';
import { SimulationRepository } from '../../domain/interfaces/simulation-repository.interface';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';

@Injectable()
export class GetSimulationUseCase {
  private readonly logger = new Logger(GetSimulationUseCase.name);

  constructor(
    @Inject('SimulationRepository')
    private readonly simulationRepository: SimulationRepository,
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(simulationId: string, userId: string): Promise<ProjectSimulation> {
    this.logger.log(`Récupération de la simulation ${simulationId} par l'utilisateur ${userId}`);

    const simulation = await this.simulationRepository.findById(simulationId);
    if (!simulation) {
      throw new NotFoundException('Simulation non trouvée. Vérifiez que l\'ID de simulation est correct.');
    }

    const project = await this.projectRepository.findById(simulation.projectId);
    if (!project) {
      throw new NotFoundException('Projet associé à cette simulation non trouvé.');
    }

    if (project.ownerId !== userId) {
      throw new BadRequestException('Accès refusé. Vous ne pouvez consulter que les simulations de vos propres projets.');
    }

    return simulation;
  }

  async getSimulationsByProject(projectId: string, userId: string): Promise<ProjectSimulation[]> {
    this.logger.log(`Récupération des simulations pour le projet ${projectId} par l'utilisateur ${userId}`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projet non trouvé. Vérifiez que le projet existe et que vous y avez accès.');
    }

    if (project.ownerId !== userId) {
      throw new BadRequestException('Accès refusé. Vous ne pouvez consulter que les simulations de vos propres projets.');
    }

    const simulations = await this.simulationRepository.findByProjectId(projectId);
    return simulations;
  }

  async getLatestSimulation(projectId: string, userId: string): Promise<ProjectSimulation | null> {
    this.logger.log(`Récupération de la dernière simulation pour le projet ${projectId} par l'utilisateur ${userId}`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projet non trouvé. Vérifiez que le projet existe et que vous y avez accès.');
    }

    if (project.ownerId !== userId) {
      throw new BadRequestException('Accès refusé. Vous ne pouvez consulter que les simulations de vos propres projets.');
    }

    const simulation = await this.simulationRepository.findLatestByProject(projectId);
    return simulation;
  }
}
