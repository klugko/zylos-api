import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from '@core/common/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CreateSimulationDto, SimulationResponseDto } from '../../application/dto/simulation.dto';
import { CreateSimulationUseCase } from '../../application/use-cases/create-simulation.use-case';
import { GetSimulationUseCase } from '../../application/use-cases/get-simulation.use-case';
import { SimulationScenario } from '../../domain/entities/simulation.entity';

@ApiTags('Simulations de Projet')
@Controller('api/v1/projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SimulationController {
  constructor(
    private readonly createSimulationUC: CreateSimulationUseCase,
    private readonly getSimulationUC: GetSimulationUseCase,
  ) {}

  @Post(':projectId/simulations')
  @ApiOperation({ 
    summary: 'Créer une simulation de projet',
    description: 'Génère une simulation avec les scénarios demandés (par défaut tous) pour estimer la durée, le coût et les ressources nécessaires.'
  })
  @ApiParam({ 
    name: 'projectId', 
    description: 'ID du projet à simuler',
    example: '8ff5ec2e-9d74-424e-801b-6d6a76f6a49e'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Simulation créée avec succès',
    type: SimulationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Données invalides ou accès refusé',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Au moins un scénario doit être spécifié (optimal, realistic, ou degraded).' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Projet non trouvé',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Projet non trouvé. Vérifiez que le projet existe et que vous y avez accès.' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Erreur lors de la génération de la simulation',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 500 },
        message: { type: 'string', example: 'Erreur lors de la génération de la simulation. Veuillez réessayer.' },
        error: { type: 'string', example: 'Internal Server Error' }
      }
    }
  })
  async createSimulation(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSimulationDto,
    @CurrentUser() user: User,
  ): Promise<SimulationResponseDto> {
    try {
    
      const simulationDto = {
        scenarios: dto.scenarios || [SimulationScenario.OPTIMAL, SimulationScenario.REALISTIC, SimulationScenario.DEGRADED]
      };

      const simulation = await this.createSimulationUC.execute(projectId, simulationDto, user.id);

      return {
        id: simulation.id,
        projectId: simulation.projectId,
        scenarios: simulation.scenarios,
        impactFactors: simulation.impactFactors,
        recommendedScenario: simulation.getRecommendedScenario(),
        costRange: simulation.getCostRange(),
        durationRange: simulation.getDurationRange(),
        createdAt: simulation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Erreur lors de la génération de la simulation. Veuillez réessayer.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('simulations/:simulationId')
  @ApiOperation({ 
    summary: 'Récupérer une simulation spécifique',
    description: 'Récupère les détails d\'une simulation de projet par son ID'
  })
  @ApiParam({ 
    name: 'simulationId', 
    description: 'ID de la simulation',
    example: 'sim_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Simulation récupérée avec succès',
    type: SimulationResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Simulation non trouvée',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Simulation non trouvée. Vérifiez que l\'ID de simulation est correct.' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Accès refusé',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Accès refusé. Vous ne pouvez consulter que les simulations de vos propres projets.' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async getSimulation(
    @Param('simulationId') simulationId: string,
    @CurrentUser() user: User,
  ): Promise<SimulationResponseDto> {
    try {
      const simulation = await this.getSimulationUC.execute(simulationId, user.id);

      return {
        id: simulation.id,
        projectId: simulation.projectId,
        scenarios: simulation.scenarios,
        impactFactors: simulation.impactFactors,
        recommendedScenario: simulation.getRecommendedScenario(),
        costRange: simulation.getCostRange(),
        durationRange: simulation.getDurationRange(),
        createdAt: simulation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Erreur lors de la récupération de la simulation.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':projectId/simulations')
  @ApiOperation({ 
    summary: 'Récupérer toutes les simulations d\'un projet',
    description: 'Récupère l\'historique de toutes les simulations créées pour un projet'
  })
  @ApiParam({ 
    name: 'projectId', 
    description: 'ID du projet',
    example: 'proj_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Simulations récupérées avec succès',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/SimulationResponseDto' }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Projet non trouvé',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Projet non trouvé. Vérifiez que le projet existe et que vous y avez accès.' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async getProjectSimulations(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<SimulationResponseDto[]> {
    try {
      const simulations = await this.getSimulationUC.getSimulationsByProject(projectId, user.id);

      return simulations.map(simulation => ({
        id: simulation.id,
        projectId: simulation.projectId,
        scenarios: simulation.scenarios,
        impactFactors: simulation.impactFactors,
        recommendedScenario: simulation.getRecommendedScenario(),
        costRange: simulation.getCostRange(),
        durationRange: simulation.getDurationRange(),
        createdAt: simulation.createdAt,
      }));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Erreur lors de la récupération des simulations du projet.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':projectId/simulations/latest')
  @ApiOperation({ 
    summary: 'Récupérer la dernière simulation d\'un projet',
    description: 'Récupère la simulation la plus récente pour un projet'
  })
  @ApiParam({ 
    name: 'projectId', 
    description: 'ID du projet',
    example: 'proj_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dernière simulation récupérée avec succès',
    type: SimulationResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Aucune simulation trouvée pour ce projet',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Aucune simulation trouvée pour ce projet.' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async getLatestSimulation(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ): Promise<SimulationResponseDto | null> {
    try {
      const simulation = await this.getSimulationUC.getLatestSimulation(projectId, user.id);

      if (!simulation) {
        throw new HttpException(
          'Aucune simulation trouvée pour ce projet.',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        id: simulation.id,
        projectId: simulation.projectId,
        scenarios: simulation.scenarios,
        impactFactors: simulation.impactFactors,
        recommendedScenario: simulation.getRecommendedScenario(),
        costRange: simulation.getCostRange(),
        durationRange: simulation.getDurationRange(),
        createdAt: simulation.createdAt,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Erreur lors de la récupération de la dernière simulation.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
