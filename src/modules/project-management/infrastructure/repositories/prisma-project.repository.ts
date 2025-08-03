import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { UpdateProjectDto } from '../../application/dto/update-project.dto';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';
import { ChecklistDetails, ProjectWithDetails, TaskDetails } from '@modules/project-management/domain/entities/project-with-details.entity';
import { ChecklistPriority, ChecklistStatus } from '@modules/project-management/domain/enums/checklist.enums';
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly ownerSelect = {
    id: true,
    fullname: true,
    email: true,
    role: true,
    isActive: true,
    skills: true,
    availability: true,
    performanceScore: true,
    createdAt: true,
    updatedAt: true,
  };

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
      include: {
        owner: {
          select: this.ownerSelect
        }
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
      include: {
        owner: {
          select: this.ownerSelect
        }
      },
    });

    return this.mapToEntity(updated);
  }

  private mapToEntity(record: any): Project {
    const project = new Project(
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

    if (record.owner) {
      project.owner = record.owner;
    }

    return project;
  }

  async findAll(): Promise<Project[]> {
    const records = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: this.ownerSelect
        }
      },
    });
  
    return records.map(this.mapToEntity);
  }

  async findAllByOwner(ownerId: string): Promise<Project[]> {
    const records = await this.prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: this.ownerSelect
        }
      },
    });

    return records.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: this.ownerSelect
        }
      },
    });

    return record ? this.mapToEntity(record) : null;
  }

  async findAllWithDetails(): Promise<ProjectWithDetails[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        owner: {
          select: this.ownerSelect
        },
        tasks: true,
        checklists: true,
      },
    });

    return projects.map((p) => {
      const base = new Project(
        p.id, p.name, p.description, p.clientType, p.industry,
        p.color, p.startDate, p.endDate, p.budget?.toNumber() ?? null,
        p.progress, p.status, p.priority, p.isArchived,
        p.createdAt, p.updatedAt, p.ownerId, p.templateId
      );

      if (p.owner) {
        base.owner = {
          ...p.owner,
          role: p.owner.role as UserRole, 
        };
      }

      const tasks = p.tasks.map((t) =>
        new TaskDetails(
          t.id, t.title, t.description, t.status, t.priority,
          t.dueDate, t.startDate, t.endDate, t.progress,
          t.color, t.estimatedTime, t.assignedUserId, t.projectId
        )
      );

      const checklists = p.checklists.map((c) =>
        new ChecklistDetails(
          c.id,
          c.title,
          c.projectId,
          c.createdAt,
          c.updatedAt,
          c.status as ChecklistStatus,
          c.priority as ChecklistPriority,
          c.assignedUserId
        )
      );
      return new ProjectWithDetails(base, tasks, checklists);
    });
  }

  async findFullDataByUserId(userId: string): Promise<any> {
    return this.prisma.project.findMany({
      where: {
        OR: [
          {
            tasks: {
              some: {
                assignedUserId: userId,
              },
            },
          },
          {
            checklists: {
              some: {
                assignedUserId: userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: this.ownerSelect
        },
        tasks: {
          where: {
            assignedUserId: userId,
          },
          include: {
            checklistItems: true,
            checklists: true,
          },
        },
        checklists: {
          where: {
            assignedUserId: userId,
          },
          include: {
            items: true,
          },
        },
      },
    });
  }
}