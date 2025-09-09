export enum SimulationScenario {
  OPTIMAL = 'optimal',
  REALISTIC = 'realistic',
  DEGRADED = 'degraded'
}

export interface SimulationResult {
  scenario: SimulationScenario;
  estimatedDuration: number; // en jours
  estimatedCost: number; // en euros
  requiredResources: {
    developers: number;
    designers: number;
    projectManagers: number;
    qaTesters: number;
  };
  assumptions: string[];
  confidence: number; // pourcentage de confiance (0-100)
  riskFactors: string[];
}

export interface ImpactFactor {
  factor: string;
  threshold: number;
  impact: number; // impact en jours
  description: string;
}

export class ProjectSimulation {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly scenarios: {
      optimal?: SimulationResult;
      realistic?: SimulationResult;
      degraded?: SimulationResult;
    },
    public readonly impactFactors: ImpactFactor[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  getRecommendedScenario(): SimulationScenario {
    // Basé sur l'historique du projet et les risques identifiés
    return SimulationScenario.REALISTIC;
  }

  getCostRange(): { min: number; max: number } {
    const costs = Object.values(this.scenarios)
      .filter(scenario => scenario !== undefined)
      .map(scenario => scenario!.estimatedCost);
    
    return {
      min: Math.min(...costs),
      max: Math.max(...costs)
    };
  }

  getDurationRange(): { min: number; max: number } {
    const durations = Object.values(this.scenarios)
      .filter(scenario => scenario !== undefined)
      .map(scenario => scenario!.estimatedDuration);
    
    return {
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }
}

