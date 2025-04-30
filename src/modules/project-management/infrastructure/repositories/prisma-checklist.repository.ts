import { Injectable } from '@nestjs/common';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { Checklist } from '../../domain/entities/checklist.entity';
import { PrismaService } from 'src/core/prisma/prisma.service';


@Injectable()
export class PrismaChecklistRepository implements ChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Checklist | null> {
    const data = await this.prisma.checklist.findUnique({ where: { id } });
    if (!data) return null;
    return new Checklist(
      data.id,
      data.title,
      data.completed,
      data.projectId,
      data.createdAt,
      data.updatedAt
    );
  }

  async findByProject(projectId: string): Promise<Checklist[]> {
    const results = await this.prisma.checklist.findMany({ where: { projectId } });
    return results.map(data => new Checklist(
      data.id,
      data.title,
      data.completed,
      data.projectId,
      data.createdAt,
      data.updatedAt
    ));
  }

  async create(checklist: Checklist): Promise<Checklist> {
    const data = await this.prisma.checklist.create({
      data: {
        id: checklist.id,
        title: checklist.title,
        projectId: checklist.projectId,
        completed: checklist.completed
      }
    });
    return new Checklist(
      data.id,
      data.title,
      data.completed,
      data.projectId,
      data.createdAt,
      data.updatedAt
    );
  }

  async update(checklist: Checklist): Promise<Checklist> {
    const data = await this.prisma.checklist.update({
      where: { id: checklist.id },
      data: {
        title: checklist.title,
        completed: checklist.completed
      }
    });
    return new Checklist(
      data.id,
      data.title,
      data.completed,
      data.projectId,
      data.createdAt,
      data.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklist.delete({ where: { id } });
  }
}
