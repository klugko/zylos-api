import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';


@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(project: Project): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        clientType: project.clientType as ProjectClientType,
        industry: project.industry,
        color: project.color,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        progress: project.progress,
        status: project.status as ProjectStatus,
        priority: project.priority as ProjectPriority,
        isArchived: project.isArchived,
        ownerId: project.ownerId ?? null,
        templateId: project.templateId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });

    return this.mapToEntity(created);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Projet avec l'id ${id} introuvable.`);
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  private mapToEntity(record: any): Project {
    return new Project(
      record.id,
      record.name,
      record.description,
      record.clientType,
      record.industry,
      record.color,
      record.startDate,
      record.endDate,
      record.budget,
      record.progress,
      record.status,
      record.priority,
      record.isArchived,
      record.createdAt,
      record.updatedAt,
      record.ownerId,
      record.templateId,
    );
  }

  async findAll(): Promise<Project[]> {
    const records = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  
    return records.map(this.mapToEntity);
  }

  async findAllByOwner(ownerId: string): Promise<Project[]> {
    const records = await this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({
      where: { id },
    });

    return record ? this.mapToEntity(record) : null;
  }
}
