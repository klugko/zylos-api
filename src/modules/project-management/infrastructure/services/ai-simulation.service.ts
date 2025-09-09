import { Injectable, Logger } from '@nestjs/common';
import { ISimulationService } from '../../domain/interfaces/simulation-service.interface';
import { SimulationResult, ImpactFactor, SimulationScenario } from '../../domain/entities/simulation.entity';
import axios from 'axios';

@Injectable()
export class AISimulationService implements ISimulationService {
  private readonly logger = new Logger(AISimulationService.name);
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly openaiApiKey = process.env.OPENAI_API_KEY;

  async generateSimulation(
    projectData: any,
    scenarios: SimulationScenario[]
  ): Promise<{
    scenarios: {
      optimal?: SimulationResult;
      realistic?: SimulationResult;
      degraded?: SimulationResult;
    };
    impactFactors: ImpactFactor[];
  }> {
    this.logger.log(`Génération de simulation pour le projet ${projectData.id}`);

    const prompt = this.buildSimulationPrompt(projectData, scenarios);
    
    try {
      const response = await axios.post(
        this.openaiApiUrl,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        },
      );

      const content = response.data.choices[0].message.content;
      const cleaned = this.extractJson(content);
      const parsed = JSON.parse(cleaned);

      // Filtrer les scénarios selon ceux demandés
      const filteredScenarios: any = {};
      if (scenarios.includes(SimulationScenario.OPTIMAL)) {
        filteredScenarios.optimal = parsed.scenarios.optimal;
      }
      if (scenarios.includes(SimulationScenario.REALISTIC)) {
        filteredScenarios.realistic = parsed.scenarios.realistic;
      }
      if (scenarios.includes(SimulationScenario.DEGRADED)) {
        filteredScenarios.degraded = parsed.scenarios.degraded;
      }

      return {
        scenarios: filteredScenarios,
        impactFactors: parsed.impactFactors,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la génération de simulation: ${error.message}`);

      return this.generateFallbackSimulation(projectData, scenarios);
    }
  }

  async analyzeProjectRisks(projectData: any): Promise<string[]> {
    const risks = [
      'Dépendance externe non contrôlée',
      'Changement de périmètre possible',
      'Disponibilité équipe limitée',
      'Complexité technique sous-estimée',
      'Validation client imprévisible'
    ];

    const identifiedRisks: string[] = [];
    
    if (projectData.tasks && projectData.tasks.length > 20) {
      identifiedRisks.push('Projet de grande envergure - risque de surcharge');
    }
    
    if (projectData.budget && projectData.budget < 10000) {
      identifiedRisks.push('Budget serré - risque de dépassement');
    }
    
    if (projectData.endDate) {
      const daysUntilDeadline = Math.ceil((new Date(projectData.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline < 30) {
        identifiedRisks.push('Délai serré - risque de retard');
      }
    }

    return identifiedRisks.length > 0 ? identifiedRisks : risks.slice(0, 2);
  }

  async calculateResourceNeeds(
    projectData: any,
    scenario: SimulationScenario
  ): Promise<{
    developers: number;
    designers: number;
    projectManagers: number;
    qaTesters: number;
  }> {
    const taskCount = projectData.tasks?.length || 10;
    const baseResources = {
      developers: Math.ceil(taskCount / 8),
      designers: Math.ceil(taskCount / 15),
      projectManagers: 1,
      qaTesters: Math.ceil(taskCount / 20),
    };

    switch (scenario) {
      case SimulationScenario.OPTIMAL:
        return {
          developers: Math.max(1, baseResources.developers - 1),
          designers: Math.max(1, baseResources.designers),
          projectManagers: 1,
          qaTesters: Math.max(0, baseResources.qaTesters - 1),
        };
      case SimulationScenario.REALISTIC:
        return baseResources;
      case SimulationScenario.DEGRADED:
        return {
          developers: baseResources.developers + 1,
          designers: baseResources.designers + 1,
          projectManagers: 1,
          qaTesters: baseResources.qaTesters + 1,
        };
      default:
        return baseResources;
    }
  }

  async generateImpactFactors(projectData: any): Promise<ImpactFactor[]> {
    return [
      {
        factor: 'validation_client',
        threshold: 5,
        impact: 3,
        description: 'Si validation client > 5 jours, alors projet + 3 jours'
      },
      {
        factor: 'changement_perimetre',
        threshold: 2,
        impact: 8,
        description: 'Si changement de périmètre > 2, alors projet + 8 jours'
      },
      {
        factor: 'disponibilite_equipe',
        threshold: 80,
        impact: 12,
        description: 'Si disponibilité équipe < 80%, alors projet + 12 jours'
      },
      {
        factor: 'complexite_technique',
        threshold: 3,
        impact: 6,
        description: 'Si complexité technique > 3, alors projet + 6 jours'
      },
      {
        factor: 'dependance_externe',
        threshold: 1,
        impact: 4,
        description: 'Si dépendance externe > 1, alors projet + 4 jours'
      }
    ];
  }

  private buildSimulationPrompt(projectData: any, scenarios: SimulationScenario[]): string {
    return `
Tu es un expert en gestion de projet et estimation. Analyse ce projet et génère des simulations précises.

DONNÉES DU PROJET:
${JSON.stringify(projectData, null, 2)}

GÉNÈRE une simulation avec 3 scénarios:

1. **SCÉNARIO OPTIMAL** (conditions idéales):
   - Pas de retards, équipe complète, budget suffisant
   - Validation client rapide (48h max)
   - Aucun changement de périmètre
   - Estimation basée sur les meilleures performances

2. **SCÉNARIO RÉALISTE** (conditions normales):
   - Quelques imprévus mineurs
   - Validation client normale (1 semaine)
   - 1-2 changements mineurs
   - Estimation basée sur les moyennes historiques

3. **SCÉNARIO DÉGRADÉ** (conditions difficiles):
   - Retards, surcharge, changements majeurs
   - Validation client lente (2+ semaines)
   - Changements de périmètre fréquents
   - Estimation pessimiste avec marges de sécurité

POUR CHAQUE SCÉNARIO, calcule:
- estimatedDuration: durée en jours
- estimatedCost: coût en euros (250€/jour par développeur)
- requiredResources: { developers, designers, projectManagers, qaTesters }
- assumptions: hypothèses claires et concrètes
- confidence: pourcentage de confiance (0-100)
- riskFactors: facteurs de risque identifiés

GÉNÈRE AUSSI des facteurs d'impact avec:
- factor: nom du facteur
- threshold: seuil déclencheur
- impact: impact en jours
- description: description claire

RETOURNE strictement un JSON au format:
{
  "scenarios": {
    "optimal": { ... },
    "realistic": { ... },
    "degraded": { ... }
  },
  "impactFactors": [ ... ]
}
`;
  }

  private extractJson(raw: string): string {
    return raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  private generateFallbackSimulation(
    projectData: any, 
    scenarios: SimulationScenario[]
  ): {
    scenarios: {
      optimal?: SimulationResult;
      realistic?: SimulationResult;
      degraded?: SimulationResult;
    };
    impactFactors: ImpactFactor[];
  } {
    const taskCount = projectData.tasks?.length || 10;
    const baseDuration = taskCount * 2;
    const baseCost = taskCount * 500;

    // Générer seulement les scénarios demandés
    const filteredScenarios: any = {};
    const baseImpactFactors = [
      {
        factor: 'validation_client',
        threshold: 5,
        impact: 3,
        description: 'Si validation client > 5 jours, alors projet +3 jours'
      },
      {
        factor: 'changement_perimetre',
        threshold: 2,
        impact: 8,
        description: 'Si changement de périmètre > 2, alors projet +8 jours'
      },
      {
        factor: 'disponibilite_equipe',
        threshold: 80,
        impact: 12,
        description: 'Si disponibilité équipe < 80%, alors projet +12 jours'
      }
    ];

    if (scenarios.includes(SimulationScenario.OPTIMAL)) {
      filteredScenarios.optimal = {
        scenario: SimulationScenario.OPTIMAL,
        estimatedDuration: baseDuration,
        estimatedCost: baseCost,
        requiredResources: {
          developers: Math.max(1, Math.ceil(taskCount / 8)),
          designers: Math.max(1, Math.ceil(taskCount / 15)),
          projectManagers: 1,
          qaTesters: Math.max(0, Math.ceil(taskCount / 20)),
        },
        assumptions: [
          'Validation client sous 48h',
          'Pas de changement de périmètre',
          'Équipe disponible à 100%'
        ],
        confidence: 85,
        riskFactors: ['Dépendance externe possible']
      };
    }

    if (scenarios.includes(SimulationScenario.REALISTIC)) {
      filteredScenarios.realistic = {
        scenario: SimulationScenario.REALISTIC,
        estimatedDuration: Math.ceil(baseDuration * 1.3),
        estimatedCost: Math.ceil(baseCost * 1.2),
        requiredResources: {
          developers: Math.max(1, Math.ceil(taskCount / 6)),
          designers: Math.max(1, Math.ceil(taskCount / 12)),
          projectManagers: 1,
          qaTesters: Math.max(1, Math.ceil(taskCount / 15)),
        },
        assumptions: [
          'Validation client sous 1 semaine',
          '1-2 changements mineurs',
          'Équipe disponible à 80%'
        ],
        confidence: 75,
        riskFactors: ['Changement de périmètre possible', 'Disponibilité équipe limitée']
      };
    }

    if (scenarios.includes(SimulationScenario.DEGRADED)) {
      filteredScenarios.degraded = {
        scenario: SimulationScenario.DEGRADED,
        estimatedDuration: Math.ceil(baseDuration * 1.8),
        estimatedCost: Math.ceil(baseCost * 1.5),
        requiredResources: {
          developers: Math.max(2, Math.ceil(taskCount / 4)),
          designers: Math.max(1, Math.ceil(taskCount / 8)),
          projectManagers: 1,
          qaTesters: Math.max(1, Math.ceil(taskCount / 10)),
        },
        assumptions: [
          'Validation client lente (2+ semaines)',
          'Changements de périmètre fréquents',
          'Équipe disponible à 60%'
        ],
        confidence: 60,
        riskFactors: ['Changement de périmètre fréquent', 'Disponibilité équipe limitée', 'Complexité technique sous-estimée']
      };
    }

    return {
      scenarios: filteredScenarios,
      impactFactors: baseImpactFactors
    };
  }
}

