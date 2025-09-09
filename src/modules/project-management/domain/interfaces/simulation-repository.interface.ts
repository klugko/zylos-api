import { ProjectSimulation } from '../entities/simulation.entity';

export interface SimulationRepository {
  create(simulation: ProjectSimulation): Promise<ProjectSimulation>;
  findById(id: string): Promise<ProjectSimulation | null>;
  findByProjectId(projectId: string): Promise<ProjectSimulation[]>;
  findByUserId(userId: string): Promise<ProjectSimulation[]>;
  update(simulation: ProjectSimulation): Promise<ProjectSimulation>;
  delete(id: string): Promise<void>;
  findLatestByProject(projectId: string): Promise<ProjectSimulation | null>;
}

