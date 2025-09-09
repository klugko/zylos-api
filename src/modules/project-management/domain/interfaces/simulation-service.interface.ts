import { SimulationResult, ImpactFactor, SimulationScenario } from '../entities/simulation.entity';

export interface ISimulationService {
  generateSimulation(
    projectData: any,
    scenarios: SimulationScenario[]
  ): Promise<{
    scenarios: {
      optimal?: SimulationResult;
      realistic?: SimulationResult;
      degraded?: SimulationResult;
    };
    impactFactors: ImpactFactor[];
  }>;

  analyzeProjectRisks(projectData: any): Promise<string[]>;
  
  calculateResourceNeeds(
    projectData: any,
    scenario: SimulationScenario
  ): Promise<{
    developers: number;
    designers: number;
    projectManagers: number;
    qaTesters: number;
  }>;

  generateImpactFactors(projectData: any): Promise<ImpactFactor[]>;
}

