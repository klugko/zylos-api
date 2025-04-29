import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { PrismaService } from 'src/core/prisma/prisma.service';


@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const data = await this.prisma.project.findUnique({ where: { id } });
    if (!data) return null;

    return new Project(
      data.id,
      data.name,
      data.description,
      data.type,
      data.isArchived,
      data.createdAt,
      data.updatedAt
    );
  }


  async findAll(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany();
    return projects.map((data) => new Project(
      data.id, data.name, data.description, data.type,
      data.isArchived, data.createdAt, data.updatedAt
    ));
  }


  async create(project: Project): Promise<Project> {
    const data = await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type
      }
    });
    return new Project(
      data.id, data.name, data.description, data.type,
      data.isArchived, data.createdAt, data.updatedAt
    );
  }


  async update(project: Project): Promise<Project> {
    const data = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        description: project.description,
        type: project.type
      }
    });
    return new Project(
      data.id, data.name, data.description, data.type,
      data.isArchived, data.createdAt, data.updatedAt
    );
  }


  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  
  async archive(id: string): Promise<Project> {
    const data = await this.prisma.project.update({
      where: { id },
      data: { isArchived: true }
    });
    return new Project(
      data.id, data.name, data.description, data.type,
      data.isArchived, data.createdAt, data.updatedAt
    );
  }
}
