import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SimulationScenario } from '../../domain/entities/simulation.entity';

export class CreateSimulationDto {
  @ApiProperty({ 
    description: 'Scénarios à simuler (optionnel - par défaut tous les scénarios)',
    enum: SimulationScenario,
    isArray: true,
    required: false,
    example: ['optimal', 'realistic', 'degraded']
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SimulationScenario, { each: true })
  scenarios?: SimulationScenario[];
}

export class ImpactFactorDto {
  @ApiProperty({ 
    description: 'Nom du facteur d\'impact',
    example: 'validation_client'
  })
  @IsString()
  factor: string;

  @ApiProperty({ 
    description: 'Seuil déclencheur',
    example: 5
  })
  @IsNumber()
  threshold: number;

  @ApiProperty({ 
    description: 'Impact en jours',
    example: 3
  })
  @IsNumber()
  impact: number;

  @ApiProperty({ 
    description: 'Description du facteur',
    example: 'Si validation client > 5 jours, alors projet +3 jours'
  })
  @IsString()
  description: string;
}

export class SimulationResponseDto {
  @ApiProperty({ 
    description: 'ID de la simulation',
    example: 'sim_123456789'
  })
  id: string;

  @ApiProperty({ 
    description: 'ID du projet simulé',
    example: 'proj_123456789'
  })
  projectId: string;

  @ApiProperty({ 
    description: 'Résultats des scénarios',
    example: {
      optimal: {
        scenario: 'optimal',
        estimatedDuration: 30,
        estimatedCost: 15000,
        requiredResources: {
          developers: 2,
          designers: 1,
          projectManagers: 1,
          qaTesters: 0
        },
        assumptions: ['Validation client sous 48h', 'Pas de changement de périmètre'],
        confidence: 85,
        riskFactors: ['Dépendance externe']
      }
    }
  })
  scenarios: any;

  @ApiProperty({ 
    description: 'Facteurs d\'impact identifiés',
    example: [
      {
        factor: 'validation_client',
        threshold: 5,
        impact: 3,
        description: 'Si validation client > 5 jours, alors projet +3 jours'
      }
    ]
  })
  impactFactors: any[];

  @ApiProperty({ 
    description: 'Scénario recommandé',
    example: 'realistic'
  })
  recommendedScenario: string;

  @ApiProperty({ 
    description: 'Plage de coûts',
    example: { min: 15000, max: 25000 }
  })
  costRange: { min: number; max: number };

  @ApiProperty({ 
    description: 'Plage de durée',
    example: { min: 30, max: 60 }
  })
  durationRange: { min: number; max: number };

  @ApiProperty({ 
    description: 'Date de création',
    example: '2024-01-15T10:30:00Z'
  })
  createdAt: Date;
}

