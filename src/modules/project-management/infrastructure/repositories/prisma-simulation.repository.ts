import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { SimulationRepository } from '../../domain/interfaces/simulation-repository.interface';
import { ProjectSimulation, SimulationScenario } from '../../domain/entities/simulation.entity';

@Injectable()
export class PrismaSimulationRepository implements SimulationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(simulation: ProjectSimulation): Promise<ProjectSimulation> {
    const created = await this.prisma.projectSimulation.create({
      data: {
        id: simulation.id,
        projectId: simulation.projectId,
        userId: simulation.userId,
        scenarios: JSON.parse(JSON.stringify(simulation.scenarios)),
        impactFactors: JSON.parse(JSON.stringify(simulation.impactFactors)),
        createdAt: simulation.createdAt,
        updatedAt: simulation.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<ProjectSimulation | null> {
    const simulation = await this.prisma.projectSimulation.findUnique({
      where: { id },
    });

    return simulation ? this.toDomain(simulation) : null;
  }

  async findByProjectId(projectId: string): Promise<ProjectSimulation[]> {
    const simulations = await this.prisma.projectSimulation.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return simulations.map(sim => this.toDomain(sim));
  }

  async findByUserId(userId: string): Promise<ProjectSimulation[]> {
    const simulations = await this.prisma.projectSimulation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return simulations.map(sim => this.toDomain(sim));
  }

  async update(simulation: ProjectSimulation): Promise<ProjectSimulation> {
    const updated = await this.prisma.projectSimulation.update({
      where: { id: simulation.id },
      data: {
        scenarios: JSON.parse(JSON.stringify(simulation.scenarios)),
        impactFactors: JSON.parse(JSON.stringify(simulation.impactFactors)),
        updatedAt: simulation.updatedAt,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.projectSimulation.delete({
      where: { id },
    });
  }

  async findLatestByProject(projectId: string): Promise<ProjectSimulation | null> {
    const simulation = await this.prisma.projectSimulation.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return simulation ? this.toDomain(simulation) : null;
  }

  private toDomain(simulation: any): ProjectSimulation {
    return new ProjectSimulation(
      simulation.id,
      simulation.projectId,
      simulation.userId,
      simulation.scenarios,
      simulation.impactFactors,
      simulation.createdAt,
      simulation.updatedAt
    );
  }
}
