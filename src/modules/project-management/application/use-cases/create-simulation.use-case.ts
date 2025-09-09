import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CreateSimulationDto } from '../dto/simulation.dto';
import { ProjectSimulation, SimulationScenario } from '../../domain/entities/simulation.entity';
import { ISimulationService } from '../../domain/interfaces/simulation-service.interface';
import { SimulationRepository } from '../../domain/interfaces/simulation-repository.interface';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CreateSimulationUseCase {
  private readonly logger = new Logger(CreateSimulationUseCase.name);

  constructor(
    @Inject('ISimulationService')
    private readonly simulationService: ISimulationService,
    @Inject('SimulationRepository')
    private readonly simulationRepository: SimulationRepository,
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string, dto: CreateSimulationDto, userId: string): Promise<ProjectSimulation> {
    this.logger.log(`Création de simulation pour le projet ${projectId} par l'utilisateur ${userId}`);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Projet non trouvé. Vérifiez que le projet existe et que vous y avez accès.');
    }

    if (project.ownerId !== userId) {
      throw new BadRequestException('Accès refusé. Vous ne pouvez simuler que vos propres projets.');
    }

    if (!dto.scenarios || dto.scenarios.length === 0) {
      throw new BadRequestException('Au moins un scénario doit être spécifié (optimal, realistic, ou degraded).');
    }

    const projectData = await this.prepareProjectData(projectId);


    const simulationResult = await this.simulationService.generateSimulation(
      projectData,
      dto.scenarios
    );

    const simulation = new ProjectSimulation(
      uuid(),
      projectId,
      userId,
      simulationResult.scenarios,
      simulationResult.impactFactors,
      new Date(),
      new Date()
    );

    const savedSimulation = await this.simulationRepository.create(simulation);

    this.logger.log(`Simulation créée avec succès: ${savedSimulation.id}`);

    return savedSimulation;
  }

  private async prepareProjectData(projectId: string): Promise<any> {

    const project = await this.projectRepository.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Projet non trouvé lors de la préparation des données.');
    }

    const tasks = await this.projectRepository.findTasksByProjectId(projectId);

    const members = await this.projectRepository.findMembersByProjectId(projectId);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget,
      progress: project.progress,
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        endDate: task.endDate,
        assignedUserId: task.assignedUserId,
      })),
      members: members.map(member => ({
        id: member.id,
        role: member.role,
        skills: member.skills,
        availability: member.availability,
        performanceScore: member.performanceScore,
      })),
    };
  }
}
